import pool from "../../database/connection";
import { ICGetProductPageInSchema} from "../../schemas/lojinha/input/getProductPageIn.schema";
import { ICGetProductPageOutArraySchema } from "../../schemas/lojinha/output/getProductPageOut.schema";

const dbQueryWithoutCategory = `
    SELECT * FROM products
    WHERE soft_delete = false
    LIMIT $1 OFFSET $2
`;

const dbQueryWithCategory = `
    SELECT * FROM products
    WHERE soft_delete = false
        AND category = $1
    LIMIT $2 OFFSET $3
`;

const getProductPageDataWithoutCategory = async(productSchema: ICGetProductPageInSchema): Promise<ICGetProductPageOutArraySchema> => {
    
    // Obtém página de produtos
    const offset = (productSchema.page - 1) * productSchema.page_size; // Número de páginas puladas antes de obter dados
    const products : ICGetProductPageOutArraySchema= (await pool.query(dbQueryWithoutCategory, [productSchema.page_size, offset])).rows;

    // Retorna página de produtos
    return products;
}

const getProductPageDataWithCategory = async(productSchema: ICGetProductPageInSchema): Promise<ICGetProductPageOutArraySchema> => {
    
    // Obtém página de produtos
    const offset = (productSchema.page - 1) * productSchema.page_size; // Número de páginas puladas antes de obter dados
    const products : ICGetProductPageOutArraySchema = (await pool.query(dbQueryWithCategory, [productSchema.category, productSchema.page_size, offset])).rows;

    // Retorna página de produtos
    return products;
}

export {getProductPageDataWithoutCategory, getProductPageDataWithCategory};