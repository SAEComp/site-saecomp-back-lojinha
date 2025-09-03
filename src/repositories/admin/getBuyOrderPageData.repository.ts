import pool from "../../database/connection";
import { ICGetBuyOrderPageInSchema } from "../../schemas/lojinha/input/getBuyOrderPageIn.schema";
import { ICGetBuyOrderPageOutArraySchema } from "../../schemas/lojinha/output/getBuyOrderPageOut.schema";

const dbQueryWithoutStatus = `
    SELECT * FROM buy_orders
    WHERE status != 'cart'
    ORDER BY "date" DESC, id DESC
    LIMIT $1 OFFSET $2
`;

const dbQueryWithStatus = `
    SELECT * FROM buy_orders
    WHERE status = $1
    ORDER BY "date" DESC, id DESC
    LIMIT $2 OFFSET $3
`;

const getBuyOrderPageDataWithoutStatus = async(inSchema: ICGetBuyOrderPageInSchema): Promise<ICGetBuyOrderPageOutArraySchema> => {
    
    // Obtém página de produtos
    const offset = (inSchema.page - 1) * inSchema.page_size; // Número de páginas puladas antes de obter dados
    const buyOrders : ICGetBuyOrderPageOutArraySchema = (await pool.query(dbQueryWithoutStatus, [inSchema.page_size, offset])).rows;

    // Retorna página de produtos
    return buyOrders;
}

const getBuyOrderPageDataWithStatus = async(inSchema: ICGetBuyOrderPageInSchema): Promise<ICGetBuyOrderPageOutArraySchema> => {
    
    // Obtém página de produtos
    const offset = (inSchema.page - 1) * inSchema.page_size; // Número de páginas puladas antes de obter dados
    const buyOrders : ICGetBuyOrderPageOutArraySchema = (await pool.query(dbQueryWithStatus, [inSchema.status , inSchema.page_size, offset])).rows;

    // Retorna página de produtos
    return buyOrders;
}

export {getBuyOrderPageDataWithoutStatus, getBuyOrderPageDataWithStatus};