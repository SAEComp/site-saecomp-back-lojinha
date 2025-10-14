import { registerRoute } from "../registerRoute";
import { z } from "zod";
import { getProductPageInSchema } from "../../schemas/lojinha/input/getProductPageIn.schema";
import { getProductInSchema } from "../../schemas/lojinha/input/getProductIn.schema";
import { addToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";
import { addCommentInSchema } from "../../schemas/lojinha/input/addComentIn.schema";
import { finishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { registerPaymentInSchema } from "../../schemas/lojinha/input/registerPaymentIn.schema";
import { cancelPaymentInSchema } from "../../schemas/lojinha/input/cancelPaymentIn.schema";
import { deleteItemInSchema } from "../../schemas/lojinha/input/deleteItemIn.schema";
import { listenPaymentInSchema } from "../../schemas/lojinha/input/listenPaymentIn.schema";
import { getPunctuationPageInSchema } from "../../schemas/lojinha/input/getPunctuationPageIn.schema";
import { getProductPageOutSchema } from "../../schemas/lojinha/output/getProductPageOut.schema";
import { getProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";
import { getCartOutSchema } from "../../schemas/lojinha/output/getCartOut.schema";
import { addToCartOutSchema } from "../../schemas/lojinha/output/addToCartOut.schema";
import { addCommentOutSchema } from "../../schemas/lojinha/output/addCommentOut.schema";
import { finishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { registerPaymentOutSchema } from "../../schemas/lojinha/output/registerPaymentOut.schema";
import { getPendingPaymentOutSchema } from "../../schemas/lojinha/output/getPendingPaymentsOut.schema";
import { getPunctuationOutSchema } from "../../schemas/lojinha/output/getPunctuationOut.schema";
import { getPunctuationPageOutSchema } from "../../schemas/lojinha/output/getPunctuationPageOut.schema";

export function registerClientLojinhaRoutesDocs() {
    // GET /api/lojinha/products
    registerRoute({
        method: "get",
        path: "/products",
        tags: ["Client Lojinha"],
        summary: "Lista produtos com filtros e paginação",
        request: {
            query: getProductPageInSchema.openapi("getProductPageInSchema"),
        },
        responses: {
            200: {
                description: "Lista paginada de produtos",
                schema: getProductPageOutSchema.openapi("getProductPageOutSchema"),
            },
        },
    });

    // GET /api/lojinha/product
    registerRoute({
        method: "get",
        path: "/product",
        tags: ["Client Lojinha"],
        summary: "Obtém detalhes de um produto específico",
        request: {
            query: getProductInSchema.openapi("getProductInSchema"),
        },
        responses: {
            200: {
                description: "Detalhes do produto",
                schema: getProductOutSchema.openapi("getProductOutSchema"),
            },
        },
    });

    // GET /api/lojinha/cart
    registerRoute({
        method: "get",
        path: "/cart",
        tags: ["Client Lojinha"],
        summary: "Obtém o carrinho do usuário",
        responses: {
            200: {
                description: "Carrinho do usuário",
                schema: getCartOutSchema.openapi("getCartOutSchema"),
            },
        },
    });

    // POST /api/lojinha/cart
    registerRoute({
        method: "post",
        path: "/cart",
        tags: ["Client Lojinha"],
        summary: "Adiciona ou atualiza item no carrinho",
        request: {
            body: addToCartInSchema.openapi("addToCartInSchema"),
        },
        responses: {
            200: {
                description: "Item adicionado ao carrinho",
                schema: addToCartOutSchema.openapi("addToCartOutSchema"),
            },
        },
    });

    // DELETE /api/lojinha/cart
    registerRoute({
        method: "delete",
        path: "/cart",
        tags: ["Client Lojinha"],
        summary: "Limpa o carrinho do usuário",
        responses: {
            200: {
                description: "Carrinho deletado com sucesso"
            },
        },
    });

    // DELETE /api/lojinha/item
    registerRoute({
        method: "delete",
        path: "/item",
        tags: ["Client Lojinha"],
        summary: "Remove item específico do carrinho",
        request: {
            query: deleteItemInSchema.openapi("deleteItemInSchema"),
        },
        responses: {
            200: {
                description: "Item removido do carrinho com sucesso"
            },
        },
    });

    // POST /api/lojinha/comment
    registerRoute({
        method: "post",
        path: "/comment",
        tags: ["Client Lojinha"],
        summary: "Adiciona comentário/avaliação",
        request: {
            body: addCommentInSchema.openapi("addCommentInSchema"),
        },
        responses: {
            200: {
                description: "Comentário adicionado com sucesso",
                schema: addCommentOutSchema.openapi("addCommentOutSchema"),
            },
        },
    });

    // POST /api/lojinha/finish-order
    registerRoute({
        method: "post",
        path: "/finish-order",
        tags: ["Client Lojinha"],
        summary: "Finaliza pedido e gera pagamento PIX",
        request: {
            body: finishBuyInSchema.openapi("finishBuyInSchema"),
        },
        responses: {
            200: {
                description: "Pedido finalizado e QR Code PIX gerado",
                schema: finishBuyOutSchema.openapi("finishBuyOutSchema"),
            },
        },
    });

    // GET /api/lojinha/listen-payment
    registerRoute({
        method: "get",
        path: "/listen-payment",
        tags: ["Client Lojinha"],
        summary: "Verifica status do pagamento",
        request: {
            query: listenPaymentInSchema.openapi("listenPaymentInSchema"),
        },
        responses: {
            200: {
                description: "Status do pagamento",
                schema: z.object({
                    paid: z.boolean().describe("Se o pagamento foi confirmado"),
                    status: z.string().describe("Status atual do pagamento"),
                }).openapi("ListenPaymentResponseSchema"),
            },
        },
    });

    // POST /api/lojinha/confirm-payment
    registerRoute({
        method: "post",
        path: "/confirm-payment",
        tags: ["Client Lojinha"],
        summary: "Webhook do Mercado Pago para confirmar pagamento",
        request: {
            body: z.object({
                action: z.string().describe("Ação do webhook"),
                api_version: z.string().describe("Versão da API"),
                data: z.object({
                    id: z.string().describe("ID do pagamento no Mercado Pago"),
                }).describe("Dados do pagamento"),
                date_created: z.string().describe("Data de criação"),
                id: z.number().describe("ID do evento"),
                live_mode: z.boolean().describe("Se está em modo produção"),
                type: z.string().describe("Tipo do evento"),
                user_id: z.string().describe("ID do usuário Mercado Pago"),
            }).openapi("ConfirmPaymentWebhookSchema"),
        },
        responses: {
            200: {
                description: "Webhook processado com sucesso"
            },
        },
    });

    // POST /api/lojinha/register-payment
    registerRoute({
        method: "post",
        path: "/register-payment",
        tags: ["Client Lojinha"],
        summary: "Registra pagamento manual",
        request: {
            body: registerPaymentInSchema.openapi("registerPaymentInSchema"),
        },
        responses: {
            200: {
                description: "Pagamento registrado com sucesso",
                schema: registerPaymentOutSchema.openapi("registerPaymentOutSchema"),
            },
        },
    });

    // POST /api/lojinha/cancel-payment
    registerRoute({
        method: "post",
        path: "/cancel-payment",
        tags: ["Client Lojinha"],
        summary: "Cancela um pagamento pendente",
        request: {
            body: cancelPaymentInSchema.openapi("cancelPaymentInSchema"),
        },
        responses: {
            200: {
                description: "Pagamento cancelado com sucesso"
            },
        },
    });

    // GET /api/lojinha/punctuation
    registerRoute({
        method: "get",
        path: "/punctuation",
        tags: ["Client Lojinha"],
        summary: "Obtém pontuação atual do usuário",
        responses: {
            200: {
                description: "Pontuação do usuário",
                schema: getPunctuationOutSchema.openapi("getPunctuationOutSchema"),
            },
        },
    });

    // GET /api/lojinha/punctuations
    registerRoute({
        method: "get",
        path: "/punctuations",
        tags: ["Client Lojinha"],
        summary: "Lista histórico de pontuações",
        request: {
            query: getPunctuationPageInSchema.openapi("getPunctuationPageInSchema"),
        },
        responses: {
            200: {
                description: "Histórico paginado de pontuações",
                schema: getPunctuationPageOutSchema.openapi("getPunctuationPageOutSchema"),
            },
        },
    });

    // GET /api/lojinha/pending-payment
    registerRoute({
        method: "get",
        path: "/pending-payment",
        tags: ["Client Lojinha"],
        summary: "Obtém pedidos pendentes de pagamento do usuário",
        responses: {
            200: {
                description: "Lista de pedidos pendentes de pagamento",
                schema: getPendingPaymentOutSchema.openapi("getPendingPaymentOutSchema"),
            },
        },
    });

}