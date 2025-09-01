import pool from "../../database/connection";
import { ICAddProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";

const dbQueryAddProduct = `
    INSERT INTO products (name, value, description, quantity, category, img_url ,bar_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT bar_code DO NOTHING
    RETURNING ID
`;

export const addProductData = async(inSchema: ICAddProductInSchema): Promise<number|null> => {
    
    // Retorna id do produto adicionado
    const { id } = (await pool.query(dbQueryAddProduct, [inSchema.name, inSchema.value, 
        inSchema.description, inSchema.quantity, inSchema.category, inSchema.img_url, inSchema.bar_code])).rows[0];
    return id
}