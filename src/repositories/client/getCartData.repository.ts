import pool from "../../database/connection";
import { ICGetCartOutSchema } from "../../schemas/lojinha/output/getCartOut.schema";


const dbQueryGetCart = `
    SELECT * FROM buy_orders 
    WHERE user_id = $1
        AND status = 'cart' 
`;

const getCartData = async(user_id: number): Promise<ICGetCartOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQueryGetCart, [user_id]);

    // Obtenção de produto procurado
    const buyOrder : ICGetCartOutSchema = result.rows[0];

    // Retorna produto
    return buyOrder;
}

export {getCartData}