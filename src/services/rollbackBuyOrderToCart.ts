import pool from "../database/connection";
import { ApiError } from "../errors/ApiError";

const dbQueryRollbackBuyOrderToCart = `
    UPDATE buy_orders
    SET status = 'cart'
    WHERE id = $1
`;

const dbQueryRollbackBuyOrderToCartItems = `
    WITH oldproduct AS (
        SELECT 
            product_id, 
            quantity 
        FROM items i
        INNER JOIN buy_orders bo ON i.buy_order_id = bo.id
        WHERE 
            i.buy_order_id = $1
            AND bo.status = 'pending_payment'
    )
    UPDATE products
    SET quantity = products.quantity + oldproduct.quantity
    FROM oldproduct
    WHERE products.id = oldproduct.product_id;
`;


const rollbackBuyOrderToCart = async(buyOrderId: number): Promise<void> => {
    // Início de transação
    const client = await pool.connect();
    try{
        await client.query('BEGIN');

        // Reverte os itens do pedido para o estoque
        const rowCountItems = (await client.query(dbQueryRollbackBuyOrderToCartItems, [buyOrderId])).rowCount;
        if(!rowCountItems){
            throw new ApiError(500, 'Erro ao reverter os itens do pedido para o estoque');
        }
        
        // Reverte o status do pedido para 'cart'
        const rowCountOrders = (await client.query(dbQueryRollbackBuyOrderToCart, [buyOrderId])).rowCount;
        if(!rowCountOrders){
            throw new ApiError(500, 'Erro ao reverter o pedido para o carrinho');
        }

        // Confirma a transação
        await client.query('COMMIT');

    }catch(error){
        // Em caso de erro, desfaz a transação
        await client.query('ROLLBACK');
        throw error;
    }finally{
        // Libera o cliente da conexão
        client.release();
    }
}

export default rollbackBuyOrderToCart;