import { check } from "zod";
import pool from "../../database/connection";

const dbQueryVerifyProduct = `
    SELECT 1 FROM products
    WHERE id = $1 
        AND soft_delete = false
        AND quantity >= $2
`;

const dbQuerySearchCart = `
    SELECT id FROM buy_orders
    WHERE buy_orders.users_id = $1
        AND buy_orders.status = 'cart'
`;

const dbQueryCreateCart = `
    INSERT INTO buy_orders (users_id, date, status)
    VALUES ($1, CURRENT_DATE, 'cart')
    ON CONFLICT (users_id, status) DO NOTHING
    RETURNING id
`;

const dbQuerySearchItem = `
    SELECT id FROM items
    WHERE buy_orders_id = $1
        AND products_id = $2
`;

const dbQueryCreateItem = `
    INSERT INTO items (products_id, buy_orders_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (buy_orders_id, products_id) DO NOTHING
`;

const dbQueryUpdateItems = `
    UPDATE items i
    SET quantity = $1 
    FROM buy_orders bo
    WHERE bo.users_id = $2
        AND bo.status = 'cart'
        AND i.buy_orders_id = bo.id
        AND i.products_id = $3
`;

const addtoCartData = async(user_id: number, product_id: number, quantity: number): Promise<number|null> => {
    
    // Valor retornado pela função 
    var returned: number|null= 0;
    
    // Variáveis de checagem de atualização do carrinho
    var checkProduct: number|null|undefined = 0;
    var cart_id: number|null|undefined = 0;
    var item_id: number|null|undefined = 0;
    var qntItensUpdated : number|null|undefined = 0;

    // Obtenção de conexão exclusiva com BD
    const client  = await pool.connect();
    
    // Processo de atualização da ordem de compra
    try{

        // Início de transação com BD
        await client.query('BEGIN');
        
        // Checagem de existência do produto e se está disponível em quantidade suficiente 
        checkProduct = (await client.query(dbQueryVerifyProduct, [product_id, quantity])).rowCount;

        // Se disponível
        if(checkProduct){

            // Checagem de existência do carrinho, e, caso não exista, é criado
            cart_id = (await client.query(dbQuerySearchCart, [user_id])).rows[0]?.id;
            if(!cart_id){
                cart_id = (await client.query(dbQueryCreateCart, [user_id])).rows[0]?.id;
            }
            
            /* 
                Verificação da existência do item que conecta carrinho ao produto, se existir é atualizado
                e, caso não exista, é criado
            */
            item_id = (await client.query(dbQuerySearchItem, [cart_id, product_id])).rows[0]?.id;
            if(item_id){
                qntItensUpdated = (await client.query(dbQueryUpdateItems, [quantity, user_id, product_id])).rowCount;
                returned = qntItensUpdated;
            }
            else{
                await client.query(dbQueryCreateItem, [product_id, cart_id, quantity]);
                returned = 1;
            }
        }

        // Finaliza transação com BD
        await client.query('COMMIT');

    } catch (error){

        // Caso ocorra algum erro, querys são revertidas
        await client.query('ROLLBACK');
        returned = -1
        throw error;

    } finally {

        // Termina conexão exclusiva com BD
        client.release();
    }

    return returned;

}