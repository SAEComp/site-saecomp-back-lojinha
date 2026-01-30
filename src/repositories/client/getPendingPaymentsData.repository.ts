import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetPendingPaymentOutSchema } from "../../schemas/lojinha/output/getPendingPaymentsOut.schema";

const dbQueryGetPendingPayments = `
    SELECT 
        bo.id AS "id",
        bo.date AS "date",
        COALESCE(SUM(i.value * i.quantity), 0) AS "totalValue",
        pp.payment_id AS "paymentId",
        pp.qr_code AS "qrCodeBase64",
        pp.pix_copia_cola AS "pixCopiaECola"
    FROM buy_orders bo
    INNER JOIN items i ON i.buy_order_id = bo.id
    INNER JOIN pix_payments pp ON pp.buy_order_id = bo.id
    WHERE 
        bo.user_id = $1
        AND bo.status = 'pendingPayment'
    GROUP BY bo.id, pp.payment_id, pp.qr_code, pp.pix_copia_cola
    ORDER BY bo.id DESC;
`;

const dbQueryGetItemsOfBuyOrder = `
    SELECT 
        i.id AS "id",
        p.name AS "productName",
        i.quantity AS "quantity",
        i.value AS "value"
    FROM items i
    INNER JOIN products p ON p.id = i.product_id
    WHERE i.buy_order_id = $1
    ORDER BY i.id; 
`;

export const getPendingPaymentsData = async(userId: number):Promise<ICGetPendingPaymentOutSchema> => {
    // Resultado final
    let result: ICGetPendingPaymentOutSchema = { 
        buyOrder: [] 
    };

    // Inicia uma transação para garantir a integridade dos dados
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Obtém os pedidos pendentes de pagamento
        const buyOrders = (await client.query(dbQueryGetPendingPayments, [userId])).rows;
        if(buyOrders.length === 0 || !buyOrders) {
            await client.query('ROLLBACK');
            return result;
        }

        // Para cada pedido, obtém os itens associados
        for (const order of buyOrders) {
            // Para cada pedido, obtém os itens associados, verificando se há itens
            order.item = (await client.query(dbQueryGetItemsOfBuyOrder, [order.id])).rows;
            if(!order.item || order.item.length === 0) {
                await client.query('ROLLBACK');
                return result;
            }
        }

        // Monta o resultado final
        result = { buyOrder: buyOrders };

        // Confirma a transação
        await client.query('COMMIT');

    } catch (error) {
        // Em caso de erro, desfaz a transação
        await client.query('ROLLBACK');
        throw error;

    } finally {
        // Libera o cliente de volta para o pool
        client.release();
    }

    // Retorna o resultado final
    return result as ICGetPendingPaymentOutSchema;
};