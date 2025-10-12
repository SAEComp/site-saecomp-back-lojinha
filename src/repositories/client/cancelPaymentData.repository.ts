import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICCancelPaymentInSchema } from "../../schemas/lojinha/input/cancelPaymentIn.schema";

const dbQueryRevertOrder =`
    UPDATE products 
        SET quantity = products.quantity + ord.quantity
    FROM (
        SELECT 
            i.product_id AS product_id,
            i.quantity AS quantity
        FROM items i
        INNER JOIN buy_orders bo ON i.buy_order_id = bo.id 
        WHERE
            bo.id = $1 
            AND bo.status = 'pendingPayment'
    ) AS ord
    WHERE products.id = ord.product_id
    RETURNING products.id
`

const dbQueryCancelOrder = `
    UPDATE buy_orders
        SET status = 'canceled'
    WHERE
        status = 'pendingPayment'
        AND id = $1
`

export const cancelPaymentData = async(buyOrderKey: ICCancelPaymentInSchema): Promise<void> =>{

    // Extração do id do pedido de compra
    const { buyOrderId } = buyOrderKey;
    
    // Início de transação para o cancelamento do pedido
    const client = await pool.connect();
    try{
        await client.query('BEGIN');

        // Reverte quantidades nos produtos (somente se o pedido estiver em pendingPayment)
        const qntUpdatedProducts = (await client.query(dbQueryRevertOrder, [buyOrderId])).rowCount;
        if (qntUpdatedProducts === 0) {
            await client.query('ROLLBACK');
            throw new ApiError(404, "Pedido não encontrado ou não está em 'pendingPayment'");
        }

        // Cancela pedido, atualizando seu status para 'canceled' (somente se o pedido estiver em pendingPayment)
        const qntCanceledOrders = (await client.query(dbQueryCancelOrder, [buyOrderId])).rowCount;
        if (qntCanceledOrders === 0) {
            await client.query('ROLLBACK');
            throw new ApiError(404, "Pedido não encontrado ou não está em 'pendingPayment'");
        }

        // Confirma a transação
        await client.query('COMMIT');
    }
    catch(error){
        // Em caso de erro, desfaz a transação e relança o erro
        await client.query('ROLLBACK');
        throw error;
    }
    finally{
        // Libera o cliente de volta para o pool
        client.release();
    }
};
