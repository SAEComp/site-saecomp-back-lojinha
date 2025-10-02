import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICFinishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { ICPaymentData } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { MercadoPagoConfig, Payment } from "mercadopago"


const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'pendingPayment', "date" = CURRENT_TIMESTAMP
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


export const finishBuyData = async(buyKey: ICFinishBuyInSchema): Promise<number> =>{

    // Valor total como variável de retorno
    let buyOrderValue: number = 0;
    
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
            
            buyOrderValue += (items[i].value * items[i].quantity);
        }
        if(buyOrderValue <= 0){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Pedido vazio ou inexistente');
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
    return buyOrderValue;
};




