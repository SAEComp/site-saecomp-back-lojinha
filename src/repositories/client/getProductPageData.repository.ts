import pool from "../../database/connection";
import { ICGetProductPageInSchema} from "../../schemas/lojinha/input/getProductPageIn.schema";
import { ICGetProductPageOutSchema } from "../../schemas/lojinha/output/getProductPageOut.schema";

export const getProductPageData = async(inSchema: ICGetProductPageInSchema): Promise<ICGetProductPageOutSchema> => {
    
    // Desestruturação do schema de entrada
    const {page, pageSize, category, name} = inSchema;

    // Partes dinâmicas da query
    let params: string[] = ['soft_delete = $1'];
    let values: any[] = [false];

    // Adiciona filtros conforme parâmetros de entrada
    if(category){
        params.push('category = $' + (values.length + 1));
        values.push(category);
    }
    if(name){
        params.push('name ILIKE $' + (values.length + 1));
        values.push(`%${name}%`);
    }

    // Query completa
    const dbQuery = `
        SELECT 
            id,
            name,
            value,
            description,
            quantity,
            bar_code AS "barCode",
            img_url AS "imgUrl",
            category 
        FROM products
        WHERE 
            ${params.join(' AND ')}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    
    // Adiciona paginação
    values.push(pageSize, (page - 1) * pageSize);

    // Executa a query e obtem os produtos
    const products = (await pool.query(dbQuery, values)).rows;

    // Monta o resultado conforme schema de saída
    const result: ICGetProductPageOutSchema = {
        product: products
    };

    // Retorna o resultado
    return result

}

