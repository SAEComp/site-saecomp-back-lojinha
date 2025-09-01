import pool from "../../database/connection";
import { ICFinishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { Item } from "../../interfaces/Item.interface";

const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'pendingPayment', "date" = CURRENT_DATE
    WHERE id = $1
`;

const dbQuerySearchItemsInBuyOrder = `
    SELECT 
        i.id,
        i.products_id,
        i.buy_orders_id,
        i.quantity
    FROM items i
    JOIN products p ON i.products_id = p.id
    WHERE i.buy_orders_id = $1
        AND p.soft_delete = false 
`;

const dbQueryUpdateProductAfterFinishedBuyOrder = `
    UPDATE products
    SET quantity = quantity - $1
    WHERE id = $2
        AND quantity >= $1
`;

export const finishBuyData = async(inSchema: ICFinishBuyInSchema): Promise<number|null> =>{

    // Variáveis de controle
    let returned: number|null = 0;
    let qntUpdatedBuyOrders: number|null = 0;
    
    // Array para armazenar os itens do pedido
    let items: Item[] = [];

    // Início da transação
    const client = await pool.connect();

    try{

        // Comando para iniciar a transação
        await client.query('BEGIN');

        // Atualização do status do pedido, se não encontrar o pedido, retorna null
        qntUpdatedBuyOrders = (await client.query(dbQuerySetBuyOrderToFinalized, [inSchema.buy_order_id])).rowCount;
        if(!qntUpdatedBuyOrders){
            await client.query('ROLLBACK');
            return null;
        }

        // Busca os itens do pedido, se não encontrar nenhum item, retorna null
        items = (await client.query(dbQuerySearchItemsInBuyOrder, [inSchema.buy_order_id])).rows;
        if(items.length === 0){
            await client.query('ROLLBACK');
            return null;
        }

        // Atualiza a quantidade dos produtos no estoque, se não conseguir atualizar algum produto, retorna o id do produto negativo
        for(var i: number = 0; i < items.length; i++){
            
            const rowCount = (await client.query(dbQueryUpdateProductAfterFinishedBuyOrder, [items[i].quantity, items[i].products_id])).rowCount;
            if(!rowCount || rowCount === 0){
                await client.query('ROLLBACK');
                return (-items[i].products_id);
            }
            
            returned ++;
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

    // Retorna a quantidade de produtos atualizados, caso tenha atualizado todos os produtos
    return returned;
};

