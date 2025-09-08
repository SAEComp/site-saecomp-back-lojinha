import pool from "../../database/connection";
import { ICFinishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { ApiError } from "../../errors/ApiError";

const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'pendingPayment', "date" = CURRENT_DATE
    WHERE id = $1
`;

const dbQuerySearchItemsInBuyOrder = `
    SELECT 
        i.id AS "id",
        i.quantity AS "quantity",
        i.product_id AS "productId",
        i.value AS "value"
    FROM items i
    JOIN products p ON i.product_id = p.id
    WHERE i.buy_order_id = $1
        AND p.soft_delete = false 
`;

const dbQueryUpdateProductAfterFinishedBuyOrder = `
    UPDATE products
    SET quantity = quantity - $1
    WHERE id = $2
        AND quantity >= $1
`;

/* 
    Chamada da função de repositório para finalizar o pedido
    A função retorna:
        - null, se o pedido não existir ou estiver vazio
        - número negativo, se algum produto estiver com quantidade insuficiente (o número negativo é o id do produto)
        - número positivo, que é o valor total do pedido, se tudo ocorrer bem
*/
export const finishBuyData = async(buyKey: ICFinishBuyInSchema): Promise<number|null> =>{

    // Valor total como variável de retorno
    let totalValue: number = 0;
    
    // Início da transação
    const client = await pool.connect();

    try{

        // Comando para iniciar a transação
        await client.query('BEGIN');

        // Atualização do status do pedido, se não encontrar o pedido, retorna null
        const qntUpdatedBuyOrders = (await client.query(dbQuerySetBuyOrderToFinalized, [buyKey.buyOrderId])).rowCount;
        if(!qntUpdatedBuyOrders){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Pedido não encontrado');
        }

        // Busca os itens do pedido, se não encontrar nenhum item, retorna null
        const items: any[] = (await client.query(dbQuerySearchItemsInBuyOrder, [buyKey.buyOrderId])).rows;
        if(items.length === 0){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'O pedido não possui itens válidos');
        }

        // Atualiza a quantidade dos produtos no estoque, se não conseguir atualizar algum produto, retorna o id do produto negativo
        for(var i: number = 0; i < items.length; i++){
            
            const qntUpdatedProducts = (await client.query(dbQueryUpdateProductAfterFinishedBuyOrder, [items[i].quantity, items[i].productId])).rowCount;
            if(!qntUpdatedProducts){
                await client.query('ROLLBACK');
                throw new ApiError(404, `Produto ${items[i].productId} em quantidade insuficiente`);
            }
            
            totalValue += (items[i].value * items[i].quantity);
        }

        // Comando para finalizar a transação
        await client.query('COMMIT');
    }
    catch(error){

        // Em caso de erro, desfaz a transação
        await client.query('ROLLBACK');
        
        // Lança o erro para ser tratado no controller
        throw error;

    }
    finally{

        // Libera o cliente de volta para o pool
        client.release();

    }

    // Retorna valor total do pedido
    return totalValue;
};

