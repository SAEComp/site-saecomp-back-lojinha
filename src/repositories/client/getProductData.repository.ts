import pool from "../../database/connection";
import { Product } from "../../interfaces/product.interface";

const dbQuery1 = `
    select 
    id,
    name,
    description,
    value,
    quantity,
    bar_code,
    category
    from products 
    where id = $1 and softDelete = false
`;

const dbQuery2 = `
    select 
    id,
    name,
    description,
    value,
    quantity,
    bar_code,
    category
    from products 
    where barcode = $1 and soft_delete = false
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