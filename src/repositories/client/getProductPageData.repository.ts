import pool from "../../database/connection";
import { Product } from "../../interfaces/product.interface";
import { ICGetProductPageInSchema} from "../../schemas/lojinha/input/getProductPageIn.schema";

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

const getProductPageDataWithoutCategory = async(productSchema: ICGetProductPageInSchema): Promise<Product[]> => {
    
    // Obtém página de produtos
    const offset = (productSchema.page - 1) * productSchema.pageSize; // Número de páginas puladas antes de obter dados
    const {rows} = await pool.query(dbQueryWithoutCategory, [productSchema.pageSize, offset]);
    const products : Product[] = rows;

    // Retorna página de produtos
    return products;
}

const getProductPageDataWithCategory = async(productSchema: ICGetProductPageInSchema): Promise<Product[]> => {
    
    // Obtém página de produtos
    const offset = (productSchema.page - 1) * productSchema.pageSize; // Número de páginas puladas antes de obter dados
    const {rows} = await pool.query(dbQueryWithCategory, [productSchema.category, productSchema.pageSize, offset]);
    const products : Product[] = rows;

    // Retorna página de produtos
    return products;
}

export {getProductPageDataWithoutCategory, getProductPageDataWithCategory};