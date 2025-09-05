import pool from "../../database/connection";
import { ICGetCartOutSchema } from "../../schemas/lojinha/output/getCartOut.schema";

const dbQueryGetCart = `
    SELECT
        id AS "id"
    FROM buy_orders 
    WHERE user_id = $1
        AND status = 'cart'
    LIMIT 1
`;

const dbQueryUpdateItemsQuantity = `
    UPDATE items 
    SET 
        quantity = p.quantity
    FROM products p
    WHERE
        items.buy_order_id = $1
        AND items.product_id = p.id
        AND items.quantity > p.quantity
`

const dbQueryUpdateItemsValue = `
    UPDATE items
    SET 
        value = p.value
    FROM products p
    WHERE
        items.buy_order_id = $1
        AND items.product_id = p.id
        AND items.value != p.value
`;

const dbQueryGetItems = `
    SELECT
        i.id AS "id", 
        i.product_id AS "productId",
        p.name AS "productName",
        p.quantity AS "productStock",
        i.quantity AS "quantity",
        i.value AS "value"
    FROM items i
    JOIN products p ON p.id = i.product_id
    WHERE i.buy_order_id = $1
`;

export const getCartData = async (user_id: number): Promise<ICGetCartOutSchema | null> => {

    // Variáveis de controle
    let changedCart: boolean = false;
    let cartId : number|undefined = 0;
    let qntItemsQuantityAtualized: number|null = 0;
    let qntItemsValueAtualized: number|null = 0;
    let totalValue: number = 0;
    
    // Lista de itens do carrinho
    let items: any[] = [];

    const client = await pool.connect();

    try{
        // Início de primeira transação
        await client.query('BEGIN');

        // Busca o carrinho do usuário
        cartId = (await client.query(dbQueryGetCart, [user_id])).rows[0]?.id;
        if(cartId === undefined) {
            await client.query('ROLLBACK');
            return null;
        }

        // Atualização de itens no carrinho
        qntItemsQuantityAtualized = (await client.query(dbQueryUpdateItemsQuantity, [cartId])).rowCount;
        qntItemsValueAtualized = (await client.query(dbQueryUpdateItemsValue, [cartId])).rowCount;

        // Verificação se itens foram atualizados
        if(qntItemsQuantityAtualized || qntItemsValueAtualized){
            changedCart = true;
        }

        // Fim da primeira transação
        await client.query('COMMIT');
        
        // Começo da segunda transação
        await client.query('BEGIN');

        // Busca os itens do carrinho
        items = (await pool.query(dbQueryGetItems, [cartId])).rows;
        if(!items || items.length === 0){
            await client.query('ROLLBACK');
            return null
        }
    
        // Calcula o valor total
        totalValue = items.reduce((sum, item) => sum + Number(item.value) * Number(item.quantity), 0);

        // Fim da segunda transação
        await client.query('COMMIT');
      
    }
    catch(error){

        // Reverte operações caso ocorra algum erro
        await client.query('ROLLBACK');
        throw error;
    }
    finally{

        // Fecha conexão com bd
        client.release();
    }

    // Monta o objeto de saída
    const cart: ICGetCartOutSchema = {
        id: cartId,
        changed: changedCart,
        totalValue: totalValue,
        items: items
    };

    // Retorna carrinho
    return cart;
};