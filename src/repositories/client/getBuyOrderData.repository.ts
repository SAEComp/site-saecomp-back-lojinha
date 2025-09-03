import pool from "../../database/connection";
import { ICGetBuyOrderInSchema } from "../../schemas/lojinha/input/getBuyOrderIn.schema";
import { ICGetBuyOrderOutSchema } from "../../schemas/lojinha/output/getBuyOrderOut.schema";

const dbQueryGetBuyOrderById = `
    SELECT * FROM buy_orders 
    WHERE id = $1
`;

const getBuyOrdedbQueryBuyOrderByStatus = `
    SELECT * FROM buy_orders 
    WHERE user_id = $1
        AND status = $2 
`;

const getBuyOrderDataById = async(inSchema :ICGetBuyOrderInSchema): Promise<ICGetBuyOrderOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQueryGetBuyOrderById, [inSchema.buy_order_id]);

    // Obtenção de produto procurado
    const buyOrder : ICGetBuyOrderOutSchema= result.rows[0];

    // Retorna produto
    return buyOrder;
}

const getBuyOrderDataByStatus = async(user_id: number|undefined, inSchema: ICGetBuyOrderInSchema): Promise<ICGetBuyOrderOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(getBuyOrdedbQueryBuyOrderByStatus, [user_id, inSchema.status]);

    // Obtenção de produto procurado
    const buyOrder : ICGetBuyOrderOutSchema = result.rows[0];

    // Retorna produto
    return buyOrder;
}

export {getBuyOrderDataById, getBuyOrderDataByStatus};