import pool from "../../database/connection";
import { Product } from "../../interfaces/product.interface";

const dbQuery = `
    SELECT * FROM products
    LIMIT $1 OFFSET $2
    WHERE soft_delete = false
`;

const getProductPageData = async(pageSize: number, page: number): Promise<Product[]> => {
    
    // Obtém página de produtos
    const {rows} = await pool.query(dbQuery, [pageSize, page]);
    const products : Product[] = rows;

    // Retorna página de produtos
    return products;
}

export default getProductPageData;