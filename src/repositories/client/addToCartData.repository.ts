import pool from "../../database/connection";
import { ICAddToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";
import { ICAddToCartOutSchema } from "../../schemas/lojinha/output/addToCartOut.schema";
import { ApiError } from "../../errors/ApiError";

const dbQueryCheckPendingPayments = `
    SELECT 1 FROM buy_orders
    WHERE user_id = $1
    AND status = 'pendingPayment'
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

const dbQueryVerifyProduct = `
    SELECT 1 FROM products p
    LEFT JOIN items i ON i.product_id = p.id
    LEFT JOIN buy_orders bo ON i.buy_order_id = $1 
    WHERE p.id = $2 
        AND p.soft_delete = false
        AND p.quantity >= COALESCE(i.quantity,0) + $3
`;

const dbQuerySearchItem = `
    SELECT
        id AS "id",
        quantity AS "quantity"
    FROM items
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
        quantity = quantity + $1,
        value = (SELECT value FROM products WHERE products.id = $3) 
    FROM buy_orders bo
    WHERE bo.user_id = $2
        AND bo.status = 'cart'
        AND i.buy_order_id = bo.id
        AND i.product_id = $3
`;

export const addtoCartData = async(userId: number, item: ICAddToCartInSchema): Promise<ICAddToCartOutSchema> => {
    
    // Extração do item
    const { productId, quantity } = item;

    // Valor retornado pela função 
    let returned: ICAddToCartOutSchema;

    // Obtenção de conexão exclusiva com BD
    const client  = await pool.connect();
    
    // Processo de atualização da ordem de compra
    try{

        // Início de transação com BD
        await client.query('BEGIN');

        // Antes de adicionar ao carrinho, verifica se há ordens de compra pendentes de pagamento
        const pendingPayments = (await client.query(dbQueryCheckPendingPayments, [userId])).rowCount;
        if(pendingPayments){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Existem ordens de compra pendentes de pagamento. Finalize-as antes de adicionar novos itens ao carrinho');
        }

        // Checagem de existência do carrinho, e, caso não exista, é criado
        let cartId = (await client.query(dbQuerySearchCart, [userId])).rows[0]?.id;
        if(cartId === undefined){
            // Criação do carrinho e verificação de sucesso
            cartId = (await client.query(dbQueryCreateCart, [userId])).rows[0]?.id;
            if(cartId === undefined){
                await client.query('ROLLBACK');
                throw new ApiError(404, 'Não foi possível criar o carrinho de compras');
            }
        }
        
        // Verificação se o produto existe e se há quantidade suficiente
        const checkProduct = (await client.query(dbQueryVerifyProduct, [cartId, productId, quantity])).rowCount;
        if(!checkProduct){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Produto não encontrado ou quantidade solicitada maior que a disponível em estoque');
        }

        /* 
            Verificação da existência do item que conecta carrinho ao produto, se existir é atualizado
            e, caso não exista, é criado
        */
        let item = (await client.query(dbQuerySearchItem, [cartId, productId])).rows[0];
        if(item === undefined){

            // Verificação se a quantidade é válida, não é permitido adicionar quantidade menor ou igual a zero
            if(quantity < 1){
                await client.query('ROLLBACK');
                throw new ApiError(404, 'Quantidade inválida para adicionar o item ao carrinho');
            }

            // Cria o item que conecta o produto ao carrinho
            const itemId = (await client.query(dbQueryCreateItem, [productId, cartId, quantity])).rows[0]?.id;
            
            // Se o item não foi criado, retorna null (erro inesperado)
            if(itemId === undefined){
                await client.query('ROLLBACK');
                throw new ApiError(404, 'Não foi possível adicionar o item ao carrinho');
            }
        }
        else{

            // Verificação se a quantidade é válida, não é permitido adicionar quantidade menor ou igual a zero
            if(item.quantity + quantity < 1){
                await client.query('ROLLBACK');
                throw new ApiError(404, 'Quantidade inválida para adicionar o item ao carrinho');
            }

            // Atualiza a quantidade do item no carrinho
            const qntItemsUpdated = (await client.query(dbQueryUpdateItems, [quantity, userId, productId])).rowCount;
            
            // Se o item não foi atualizado, retorna null (erro inesperado)
            if(!qntItemsUpdated){
                await client.query('ROLLBACK');
                throw new ApiError(404, 'Não foi possível atualizar o item no carrinho');
            }
        }

        // Monta o esquema de retorno
        returned = {
            buyOrderId: cartId,
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