import { check } from "zod";
import pool from "../../database/connection";

const dbQueryVerifyProduct = `
    SELECT 1 FROM products
    WHERE id = $1 
        AND soft_delete = false
        AND quantity >= $2
`;

const dbQuerySearchCart = `
    SELECT 1 FROM buy_orders
    WHEN buy_orders.users_id = $1
        AND buy_orders.status = 'cart'
`;

const dbQueryCreateCart = `
    INSERT INTO buy_orders (users_id, date, status)
    VALUES ($1, CURRENT_DATE, 'cart')
    RETURNING id
`;

const dbQuerySearchItem = `
    SELECT 1 FROM items
    WHERE items.buy_orders_id = $1
        AND products_id = $2
`;

const dbQueryCreateItem = `
    INSERT INTO items (products_id, buy_orders_id, quantity)
    VALUES ($1, $2, $3)
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

    var returned: number|null= 0;
    var checkProduct: number|null|undefined = 0;
    var cart_id: number|null|undefined = 0;
    var item_id: number|null|undefined = 0;
    var qntItensUpdated : number|null|undefined = 0;

    // Tenta criar ordem de compra, caso ela já exista para o usuário, 
    const client  = await pool.connect();
    try{
        await client.query('BEGIN');
        
        checkProduct = (await client.query(dbQueryVerifyProduct, [product_id, quantity])).rowCount;

        if(checkProduct){

            cart_id = (await client.query(dbQuerySearchCart, [user_id])).rows[0]?.id;

            if(!cart_id){
                cart_id = (await client.query(dbQueryCreateCart, [user_id])).rows[0]?.id;
            }
            
            item_id = (await client.query(dbQuerySearchItem, [cart_id, product_id])).rows[0]?.id;
            if(item_id){
                qntItensUpdated = (await client.query(dbQueryUpdateItems, [quantity, user_id, product_id])).rowCount;
                returned = 1;
            }
            else{
                await client.query(dbQueryCreateItem, [product_id, cart_id, quantity]);
                returned = 1;
            }


        }

        await client.query('COMMIT');

    } catch (error){

        await client.query('ROLLBACK');
        throw error;

    } finally {
        client.release();
    }

    return returned;

}