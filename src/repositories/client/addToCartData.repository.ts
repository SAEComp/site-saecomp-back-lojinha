import pool from "../../database/connection";
import { ICAddToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";

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
    VALUES ($1, CURRENT_DATE, 'cart')
    RETURNING id
`;

const dbQuerySearchItem = `
    SELECT id FROM items
    WHERE buy_order_id = $1
        AND product_id = $2
`;

const dbQueryCreateItem = `
    INSERT INTO items (product_id, buy_order_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (buy_order_id, product_id) DO NOTHING
    RETURNING id
`;

const dbQueryUpdateItems = `
    UPDATE items i
    SET quantity = $1 
    FROM buy_orders bo
    WHERE bo.user_id = $2
        AND bo.status = 'cart'
        AND i.buy_order_id = bo.id
        AND i.product_id = $3
`;

export const addtoCartData = async(user_id: number, inSchema: ICAddToCartInSchema): Promise<number|null> => {
    
    // Valor retornado pela função 
    var returned: number|null = 0;
    
    // Variáveis de checagem de atualização do carrinho
    var checkProduct: number|null = 0;
    var cartId: number|undefined = 0;
    var itemId: number|undefined = 0;
    var qntItensUpdated : number|null = 0;

    // Obtenção de conexão exclusiva com BD
    const client  = await pool.connect();
    
    // Processo de atualização da ordem de compra
    try{

        // Início de transação com BD
        await client.query('BEGIN');
        
        // Checagem de existência do produto e se está disponível em quantidade suficiente 
        checkProduct = (await client.query(dbQueryVerifyProduct, [inSchema.product_id, inSchema.quantity])).rowCount;

        // Se disponível, prossegue com atualização do carrinho, senão retorna 0 (produto indisponível ou quantidade insuficiente)
        if(checkProduct){

            // Checagem de existência do carrinho, e, caso não exista, é criado
            cartId = (await client.query(dbQuerySearchCart, [user_id])).rows[0]?.id;
            if(cartId === undefined){
                cartId = (await client.query(dbQueryCreateCart, [user_id])).rows[0]?.id;
            }

            // Se ainda assim o carrinho não existir, retorna null (erro inesperado)
            if(cartId === undefined){
                await client.query('ROLLBACK');
                return null;
            }

            /* 
                Verificação da existência do item que conecta carrinho ao produto, se existir é atualizado
                e, caso não exista, é criado
            */
            itemId = (await client.query(dbQuerySearchItem, [cartId, inSchema.product_id])).rows[0]?.id;
            if(itemId === undefined){
                itemId = (await client.query(dbQueryCreateItem, [inSchema.product_id, cartId, inSchema.quantity])).rows[0]?.id;
            }
            else{
                qntItensUpdated = (await client.query(dbQueryUpdateItems, [inSchema.quantity, user_id, inSchema.product_id])).rowCount;
            }

            // Se não foi possível criar ou atualizar o item, retorna null (erro inesperado)
            if(itemId === undefined || qntItensUpdated === 0){
                await client.query('ROLLBACK');
                return null;
            }

            // Se tudo ocorreu bem, retorna a quantidade de itens atualizados (1)
            returned  = qntItensUpdated;
        }

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