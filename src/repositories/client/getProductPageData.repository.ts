import pool from "../../database/connection";
import { Product } from "../../interfaces/product.interface";

const dbQuery = `
    SELECT * FROM Products
    LIMIT $1 OFFSET $2
`;

const getProductDataById = async(id: number): Promise<Product|null> => {
    
    // Obtém página de produtos
    const {rows} = await pool.query(dbQuery, [id]);

    // Obtenção de produto procurado
    const product : Product = result.rows[0];

    // Produto não encontrado
    if(!product)
        return null;

    // Retorna produto
    return product;
}

export default getProductDataById;