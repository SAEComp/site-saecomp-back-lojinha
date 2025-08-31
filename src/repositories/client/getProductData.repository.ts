import pool from "../../database/connection";
import { ICGetProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";
import { ICGetProductInSchema } from "../../schemas/lojinha/input/getProductIn.schema";

const dbQueryGetProductById = `
    SELECT 
    id,
    name,
    description,
    value,
    quantity,
    bar_code,
    category
    FROM products 
    WHERE id = $1 and soft_Delete = false
`;

const dbQueryGetProductByBarCode = `
    SELECT 
    id,
    name,
    description,
    value,
    quantity,
    bar_code,
    category
    FROM products 
    WHERE bar_code = $1 and soft_delete = false
`;

const getProductDataById = async(inSchema :ICGetProductInSchema): Promise<ICGetProductOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQueryGetProductById, [inSchema.product_id]);

    // Obtenção de produto procurado
    const product : ICGetProductOutSchema= result.rows[0];

    // Retorna produto
    return product;
}

const getProductDataByBarCode = async(inSchema: ICGetProductInSchema): Promise<ICGetProductOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQueryGetProductByBarCode, [inSchema.bar_code]);

    // Obtenção de produto procurado
    const product : ICGetProductOutSchema = result.rows[0];

    // Retorna produto
    return product;
}

export {getProductDataById, getProductDataByBarCode};