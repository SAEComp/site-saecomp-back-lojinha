// src/openapi/registerRoute.ts
import { registry } from "./registry";
import { ZodType } from "zod";
import { RouteConfig, ZodRequestBody } from "@asteasolutions/zod-to-openapi";



interface RegisterConfig extends Omit<RouteConfig, 'responses' | 'request'> {
    request?: Omit<NonNullable<RouteConfig['request']>, 'body'> & {
        // permit either a ZodType (for application/json) or an OpenAPI-style request body
        // object that contains a `content` map (used for multipart/form-data).
        body?: ZodType | { content: Record<string, any> };
    };

    responses: {
        [statusCode: string]: {
            description: string;
            schema?: ZodType ;
            event?: | { content: Record<string, any> };
        };
    };
}


const registeredSchemas = new WeakMap<ZodType, string>();

export function registerIfNeeded(schema: ZodType): { $ref: string } {
    const name = (schema as any)?._def?.openapi?._internal?.refId;
    if (!name) {
        throw new Error(
            `Schema ${schema.constructor.name} does not have an OpenAPI name defined. Use .openapi('Name') to set it.`,
        );
    }
    if (!registeredSchemas.has(schema)) {
        registry.register(name, schema);
        registeredSchemas.set(schema, name);
    }
    return { $ref: `#/components/schemas/${name}` };
}

export function registerRoute(config: RegisterConfig) {

    function buildRequestBody(body?: ZodType | { content: Record<string, any> }): ZodRequestBody | undefined {
        if (!body) return undefined;

        // if it's a Zod schema, register and return application/json content
        if ((body as any)?._def) {
            return {
                content: {
                    'application/json': {
                        schema: registerIfNeeded(body as ZodType),
                    },
                },
            };
        }

        // if it's an OpenAPI-style body with content (e.g. multipart/form-data),
        // traverse its content and register any Zod schemas found inside.
        if (typeof body === 'object' && 'content' in body && body.content && typeof body.content === 'object') {
            // shallow clone to avoid mutating caller's object
            const content = JSON.parse(JSON.stringify(body.content));

            for (const [mediaType, mediaObj] of Object.entries(body.content)) {
                const target = (content as any)[mediaType] = { ...(mediaObj as any) };

                // If schema is a ZodType, register it
                const schema = (mediaObj as any).schema;
                if (schema) {
                    if ((schema as any)?._def) {
                        target.schema = registerIfNeeded(schema as ZodType);
                    } else if (typeof schema === 'object' && schema.properties) {
                        // schema is a plain object; traverse properties and register any Zod schemas
                        const props = { ...schema.properties };
                        for (const [k, v] of Object.entries(props)) {
                            if ((v as any)?._def) {
                                props[k] = registerIfNeeded(v as ZodType);
                            }
                        }
                        target.schema = { ...schema, properties: props };
                    }
                }
            }

            return { content };
        }

        return undefined;
    }

    const request: RouteConfig['request'] = {
        ...config.request,
        body: buildRequestBody(config.request?.body),
    };

    const responses: RouteConfig['responses'] = Object.fromEntries(
        Object.entries(config.responses).map(([status, r]) => [
            +status,
            // If the response declares an `event` field, prefer that content (used for SSE).
            // Otherwise fall back to `schema` which is rendered as application/json.
            (() => {
                // Helper to process content maps and register any Zod schemas inside
                const processContent = (content?: Record<string, any>) => {
                    if (!content || typeof content !== 'object') return undefined;
                    const cloned: Record<string, any> = JSON.parse(JSON.stringify(content));

                    for (const [mediaType, mediaObj] of Object.entries(content)) {
                        const target = (cloned as any)[mediaType] = { ...(mediaObj as any) };

                        const schema = (mediaObj as any).schema;
                        if (schema) {
                            if ((schema as any)?._def) {
                                target.schema = registerIfNeeded(schema as ZodType);
                            } else if (typeof schema === 'object' && schema.properties) {
                                const props = { ...schema.properties };
                                for (const [k, v] of Object.entries(props)) {
                                    if ((v as any)?._def) {
                                        props[k] = registerIfNeeded(v as ZodType);
                                    }
                                }
                                target.schema = { ...schema, properties: props };
                            }
                        }
                    }

                    return cloned;
                };

                // If event content is provided, use it (commonly 'text/event-stream')
                if ((r as any).event && (r as any).event.content) {
                    return {
                        description: r.description,
                        content: processContent((r as any).event.content),
                    };
                }

                // Otherwise, if a Zod schema is provided, register it as application/json
                if (r.schema) {
                    return {
                        description: r.description,
                        content: {
                            'application/json': { schema: registerIfNeeded(r.schema) },
                        },
                    };
                }

                return { description: r.description };
            })(),
        ]),
    );

    registry.registerPath({
        ...config,
        request,
        responses
    });

}

