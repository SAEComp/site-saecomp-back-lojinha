import pool from "../../database/connection";
import { Product } from "../../interfaces/product.interface";

const dbQuery1 = `
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

const dbQuery2 = `
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

const getProductDataById = async(id: number): Promise<Product|null> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQuery1, [id]);

    // Obtenção de produto procurado
    const product : Product = result.rows[0];

    // Produto não encontrado
    if(!product)
        return null;

    // Retorna produto
    return product;
}

const getProductDataByBarCode = async(barCode: string): Promise<Product|null> => {
    
    // Procura produto pelo id
    const result = await pool.query(dbQuery2, [barCode]);

    // Obtenção de produto procurado
    const product : Product = result.rows[0];

    // Produto não encontrado
    if(!product)
        return null;

    // Retorna produto
    return product;
}

export {getProductDataById, getProductDataByBarCode};