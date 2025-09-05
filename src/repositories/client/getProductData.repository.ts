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
    bar_code AS "barCode",
    img_url AS "imgUrl",
    category
    FROM products 
    WHERE id = $1 AND soft_Delete = false
`;

const dbQueryGetProductByBarCode = `
    SELECT 
    id,
    name,
    description,
    value,
    quantity,
    bar_code AS "barCode",
    img_url AS "imgUrl",
    category
    FROM products 
    WHERE bar_code = $1 AND soft_delete = false
`;

const getProductDataById = async(inSchema :ICGetProductInSchema): Promise<ICGetProductOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQueryGetProductById, [inSchema.productId]);

    // Obtenção de produto procurado
    const product : ICGetProductOutSchema = result.rows[0];

    // Retorna produto
    return product;
}

const getProductDataByBarCode = async(inSchema: ICGetProductInSchema): Promise<ICGetProductOutSchema> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQueryGetProductByBarCode, [inSchema.barCode]);

    // Obtenção de produto procurado
    const product : ICGetProductOutSchema = result.rows[0];

    // Retorna produto
    return product;
}

export {getProductDataById, getProductDataByBarCode};