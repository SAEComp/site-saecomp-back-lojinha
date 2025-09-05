import pool from "../../database/connection";
import { ICRemoveProductInSchema } from "../../schemas/lojinha/input/removeProductIn.schema";

const dbQueryRemoveProduct = `
    UPDATE products
    SET soft_delete = true
    WHERE id = $1 AND soft_delete = false
`;

export const removeProductData = async(productKey: ICRemoveProductInSchema): Promise<number|null> => {
    
    // Remoção lógica do produto (soft delete)
    const rowCount = (await pool.query(dbQueryRemoveProduct, [productKey.productId])).rowCount;

    // Retorna a quantidade de linhas afetadas (0 ou 1)
    return rowCount;
}

