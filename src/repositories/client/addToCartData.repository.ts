import pool from "../../database/connection";
import { ICAddToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";
import { ICAddToCartOutSchema } from "../../schemas/lojinha/output/addToCartOut.schema";
import { ApiError } from "../../errors/ApiError";

const dbQueryVerifyProduct = `
    SELECT 1 FROM products
    WHERE id = $1 
        AND soft_delete = false
        AND quantity >= $2
`;

const dbQuerySearchCart = `
    SELECT id FROM buy_orders
    WHERE buy_orders.user_id = $1
        AND buy_orders.status = 'cart'
`;

const dbQueryCreateCart = `
    INSERT INTO buy_orders (user_id, date, status)
    VALUES ($1, CURRENT_TIMESTAMP, 'cart')
    RETURNING id
`;

const dbQuerySearchItem = `
    SELECT id FROM items
    WHERE buy_order_id = $1
        AND product_id = $2
`;

const dbQueryCreateItem = `
    INSERT INTO items (product_id, buy_order_id, quantity, value)
    VALUES ($1, $2, $3, (SELECT value FROM products WHERE products.id = $1))
    ON CONFLICT (buy_order_id, product_id) DO NOTHING
    RETURNING id
`;

const dbQueryUpdateItems = `
    UPDATE items i
    SET 
        quantity = $1,
        value = (SELECT value FROM products WHERE products.id = $3) 
    FROM buy_orders bo
    WHERE bo.user_id = $2
        AND bo.status = 'cart'
        AND i.buy_order_id = bo.id
        AND i.product_id = $3
`;

export const addtoCartData = async(userId: number, item: ICAddToCartInSchema): Promise<ICAddToCartOutSchema|null> => {
    
    // Valor retornado pela função 
    var returned: ICAddToCartOutSchema|null = null;

    // Obtenção de conexão exclusiva com BD
    const client  = await pool.connect();
    
    // Processo de atualização da ordem de compra
    try{

        // Início de transação com BD
        await client.query('BEGIN');

        // Checagem de existência do carrinho, e, caso não exista, é criado
        let cartId = (await client.query(dbQuerySearchCart, [userId])).rows[0]?.id;
        if(cartId === undefined){
            cartId = (await client.query(dbQueryCreateCart, [userId])).rows[0]?.id;
        }

        // Se ainda assim o carrinho não existir, retorna null (erro inesperado)
        if(cartId === undefined){
            await client.query('ROLLBACK');
            throw new ApiError(500, 'Não foi possível criar o carrinho de compras');
        }

        // Variáveis de checagem de insuficiência de estoque
        let insufficientStock: boolean = true;
        
        // Checagem de existência do produto e se está disponível em quantidade suficiente 
        const checkProduct = (await client.query(dbQueryVerifyProduct, [item.productId, item.quantity])).rowCount;

        // Se disponível, prossegue com atualização do carrinho, senão retorna 0 (produto indisponível ou quantidade insuficiente)
        if(checkProduct){

            // Inicialmente, assume que não há falta de estoque
            insufficientStock = false;

            /* 
                Verificação da existência do item que conecta carrinho ao produto, se existir é atualizado
                e, caso não exista, é criado
            */
            let itemId = (await client.query(dbQuerySearchItem, [cartId, item.productId])).rows[0]?.id;
            if(itemId === undefined){
                
                itemId = (await client.query(dbQueryCreateItem, [item.productId, cartId, item.quantity])).rows[0]?.id;
                
                // Se o item não foi criado, retorna null (erro inesperado)
                if(itemId === undefined){
                    await client.query('ROLLBACK');
                    throw new ApiError(500, 'Não foi possível adicionar o item ao carrinho');
                }
            }
            else{
                
                const qntItensUpdated = (await client.query(dbQueryUpdateItems, [item.quantity, userId, item.productId])).rowCount;
                
                // Se o item não foi atualizado, retorna null (erro inesperado)
                if(qntItensUpdated === 0){
                    await client.query('ROLLBACK');
                    throw new ApiError(500, 'Não foi possível atualizar o item no carrinho');
                }
            }

        }

        // Se tudo ocorreu bem, retorna o esquema de saída
        returned = {
            buyOrderId: cartId,
            insufficientStock: insufficientStock
        };
        
        // Finaliza transação com BD
        await client.query('COMMIT');

    } catch (error){

        // Caso ocorra algum erro, querys são revertidas
        await client.query('ROLLBACK');
        throw error;

    } finally {

        // Termina conexão exclusiva com BD
        client.release();
    }

    return returned;

}