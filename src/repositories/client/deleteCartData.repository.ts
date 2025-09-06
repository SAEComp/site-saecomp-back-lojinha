import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";

const dbQueryDeleteCart = `
    DELETE FROM buy_orders
    WHERE 
        user_id = $1 
        AND status = 'cart'
`;


export const deleteCartData = async (userId: number): Promise<number|null> => {

    // Deleta o carrinho através do status('cart') e id do usuário
    const qntDeleted = (await pool.query(dbQueryDeleteCart, [userId])).rowCount;

    // Retorna a quantidade de carrinhos deletados (0 ou 1)
    return qntDeleted;
};