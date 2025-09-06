import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICDeleteItemInSchema } from "../../schemas/lojinha/input/deleteItemIn.schema";

const dbQueryDeleteItem = `
    DELETE FROM items 
    WHERE
        id = $1
        AND buy_order_id IN ( 
            SELECT id from buy_orders
            WHERE user_id = $2 AND status = 'cart'
        )
`;

export const deleteItemData = async(userId: number, itemKey: ICDeleteItemInSchema): Promise<number|null> => {

    // Deleta item, e retorna a quantidade de itens deletados
    const qntDeletedItems = (await pool.query(dbQueryDeleteItem, [itemKey.itemId, userId])).rowCount;

    return qntDeletedItems
}