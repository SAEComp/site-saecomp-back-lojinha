import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

import { registerAdminLojinhaRoutesDocs } from './openapi/adminLojinha.openapi';
import { registerClientLojinhaRoutesDocs } from './openapi/clientLojinha.openapi';

registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
});


registerAdminLojinhaRoutesDocs();
registerClientLojinhaRoutesDocs();

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDoc = generator.generateDocument({
    openapi: '3.1.0',
    info: {
        title: 'SAEComp Backend API',
        version: '1.0.0',
        description: 'API para lojinha virtual',
    },
    servers: [
        { url: '/api/lojinha', description: 'Lojinha Virtual API' }
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
});
