import { registerRoute } from "../registerRoute";
import { z } from "zod";
import { addPixKeyInSchema } from "../../schemas/lojinha/input/addPixKeyIn.schema";
import { addProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";
import { addProductImageInSchema } from "../../schemas/lojinha/input/addProductImageIn.schema";
import { editProductInSchema } from "../../schemas/lojinha/input/editProductIn.schema";
import { removeProductInSchema } from "../../schemas/lojinha/input/removeProductIn.schema";
import { getBuyOrderPageInSchema } from "../../schemas/lojinha/input/getBuyOrderPageIn.schema";
import { getEntryHistoryPageInSchema } from "../../schemas/lojinha/input/getEntryHistoryPageIn.schema";
import { getStatisticsInSchema } from "../../schemas/lojinha/input/getStatisticsIn.schema";
import { addProductOutSchema } from "../../schemas/lojinha/output/addProductOut.schema";
import { getBuyOrderPageOutSchema } from "../../schemas/lojinha/output/getBuyOrderPageOut.schema";
import { getEntryHistoryPageOutSchema } from "../../schemas/lojinha/output/getEntryHistoryPageOut.schema";
import { getPixKeyOutSchema } from "../../schemas/lojinha/output/getPixKeyOut.schema";
import { getStatisticsOutSchema } from "../../schemas/lojinha/output/getStatisticsOut.schema";

export function registerAdminLojinhaRoutesDocs() {
    // POST /api/lojinha/admin/pix-key
    registerRoute({
        method: "post",
        path: "/admin/pix-key",
        tags: ["Admin Lojinha"],
        summary: "Adiciona uma chave PIX para pagamentos",
        request: {
            body: addPixKeyInSchema.openapi("addPixKeyInSchema"),
        },
        responses: {
            201: {
                description: "Chave PIX adicionada com sucesso"
            },
        },
    });

    // GET /api/lojinha/admin/pix-key
    registerRoute({
        method: "get",
        path: "/admin/pix-key",
        tags: ["Admin Lojinha"],
        summary: "Obtém a chave PIX configurada",
        responses: {
            200: {
                description: "Chave PIX atual",
                schema: getPixKeyOutSchema.openapi("getPixKeyOutSchema"),
            },
        },
    });

    // DELETE /api/lojinha/admin/pix-key
    registerRoute({
        method: "delete",
        path: "/admin/pix-key",
        tags: ["Admin Lojinha"],
        summary: "Remove a chave PIX configurada",
        responses: {
            204: {
                description: "Chave PIX removida com sucesso"
            },
        },
    });

    // POST /api/lojinha/admin/product
    registerRoute({
        method: "post",
        path: "/admin/product",
        tags: ["Admin Lojinha"],
        summary: "Adiciona um novo produto",
        request: {
            body: addProductInSchema.openapi("addProductInSchema"),
        },
        responses: {
            201: {
                description: "Produto criado com sucesso",
                schema: addProductOutSchema.openapi("addProductOutSchema"),
            },
        },
    });

    // PUT /api/lojinha/admin/product
    registerRoute({
        method: "put",
        path: "/admin/product",
        tags: ["Admin Lojinha"],
        summary: "Edita um produto existente",
        request: {
            body: editProductInSchema.openapi("editProductInSchema"),
        },
        responses: {
            200: {
                description: "Produto atualizado com sucesso"
            },
        },
    });

    // DELETE /api/lojinha/admin/product
    registerRoute({
        method: "delete",
        path: "/admin/product",
        tags: ["Admin Lojinha"],
        summary: "Remove um produto",
        request: {
            body: removeProductInSchema.openapi("removeProductInSchema"),
        },
        responses: {
            204: {
                description: "Produto removido com sucesso"
            },
        },
    });

    // GET /api/lojinha/admin/statistics
    registerRoute({
        method: "get",
        path: "/admin/statistics",
        tags: ["Admin Lojinha"],
        summary: "Obtém estatísticas da lojinha",
        request: {
            query: getStatisticsInSchema.openapi("getStatisticsInSchema"),
        },
        responses: {
            200: {
                description: "Estatísticas da lojinha",
                schema: getStatisticsOutSchema.openapi("getStatisticsOutSchema"),
            },
        },
    });

    // GET /api/lojinha/admin/orders-history
    registerRoute({
        method: "get",
        path: "/admin/orders-history",
        tags: ["Admin Lojinha"],
        summary: "Lista histórico de pedidos com filtros",
        request: {
            query: getBuyOrderPageInSchema.openapi("getBuyOrderPageInSchema"),
        },
        responses: {
            200: {
                description: "Lista paginada de pedidos",
                schema: getBuyOrderPageOutSchema.openapi("getBuyOrderPageOutSchema"),
            },
        },
    });

    // GET /api/lojinha/admin/entries-history
    registerRoute({
        method: "get",
        path: "/admin/entries-history",
        tags: ["Admin Lojinha"],
        summary: "Lista histórico de entradas com filtros",
        request: {
            query: getEntryHistoryPageInSchema.openapi("getEntryHistoryPageInSchema"),
        },
        responses: {
            200: {
                description: "Lista paginada de entradas",
                schema: getEntryHistoryPageOutSchema.openapi("getEntryHistoryPageOutSchema"),
            },
        },
    });

    // POST /api/lojinha/admin/files/product
    registerRoute({
        method: "post",
        path: "/admin/files/product",
        tags: ["Admin Lojinha"],
        summary: "Upload de imagem para produto",
        request: {
            query: addProductImageInSchema.openapi("addProductImageInSchema"),
            body: z.object({
                productImage: z.string().describe("Arquivo de imagem do produto (multipart/form-data)"),
            }).openapi("AddProductImageBodySchema"),
        },
        responses: {
            200: {
                description: "Imagem do produto enviada com sucesso",
                schema: z.object({
                    imageUrl: z.string().describe("URL da imagem enviada"),
                }).openapi("AddProductImageResponseSchema"),
            },
        },
    });
}