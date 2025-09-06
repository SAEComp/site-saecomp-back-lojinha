import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
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

export const getCartData = async (userId: number): Promise<ICGetCartOutSchema | null> => {

    // Variável de retorno
    let cart: ICGetCartOutSchema | null = null;
    
    // Lista de itens do carrinho
    let items: any[] = [];

    // Conexão com o banco de dados
    const client = await pool.connect();

    try{
        // Início de primeira transação
        await client.query('BEGIN');

        // Busca o carrinho do usuário
        const cartId = (await client.query(dbQueryGetCart, [userId])).rows[0]?.id;
        if(cartId === undefined) {
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Carrinho inexistente');
        }

        // Atualização de itens no carrinho
        const qntItemsQuantityUpdated = (await client.query(dbQueryUpdateItemsQuantity, [cartId])).rowCount;
        const qntItemsValueUpdated = (await client.query(dbQueryUpdateItemsValue, [cartId])).rowCount;

        // Verificação se itens foram atualizados
        const changedCart: boolean = (qntItemsQuantityUpdated || qntItemsValueUpdated) ? true : false;;

        // Fim da primeira transação
        await client.query('COMMIT');
        
        // Começo da segunda transação
        await client.query('BEGIN');

        // Busca os itens do carrinho
        items = (await client.query(dbQueryGetItems, [cartId])).rows;
        if(!items || items.length === 0){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Carrinho vazio');
        }
    
        // Calcula o valor total
        const totalValue : number = items.reduce((sum, item) => sum + Number(item.value) * Number(item.quantity), 0);

        // Monta o objeto do carrinho
        cart = {
            id: cartId,
            changed: changedCart,
            totalValue: totalValue,
            items: items
        };

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

    // Retorna carrinho
    return cart;
};