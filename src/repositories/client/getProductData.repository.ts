import pool from "../../database/connection";

const dbQuery1 = `
    select * from products 
    where id = $1
`;

const dbQuery2 = `
    select * from products 
    where barCode = $1
`;

const getProductData = async(id: number, barCode: string ): Promise<Product|null> => {
    
    // Procura produto pelo id
    if(id != null){ 
        const { row } = await pool.query(dbQuery1, [id]);
    }
    // Procura produto pelo código de barras
    else{ 
        const { row } = await pool.query(dbQuery2, [barCode]);
    }
    return row;
}

export default getProductData;