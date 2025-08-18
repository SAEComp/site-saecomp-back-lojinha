import pool from "../../database/connection";
import { Product } from "../../interfaces/product.interface";

const dbQuery1 = `
    select 
    id,
    name,
    description,
    value,
    quantity,
    barCode,
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
    barCode,
    category
    from products 
    where barcode = $1 and softDelete = false
`;

const getProductData = async(id: number): Promise<Product|null> => {
    
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

export default getProductData;