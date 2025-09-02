import pool from "../../database/connection";
import { ICAddProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";

const dbQueryAddProduct = `
    INSERT INTO products (name, value, description, quantity, category, img_url ,bar_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (bar_code) DO NOTHING
    RETURNING id
`;

const dbQueryAddEntryHistorie = `
    INSERT INTO entry_histories (product_id, quantity)
    VALUES ($1, $2)
    RETURNING id
`;

export const addProductData = async(inSchema: ICAddProductInSchema): Promise<number|null> => {
    
    // Variáveis de controle
    let returned: number|null = 0;
    let product_id: number|null|undefined = 0;
    let entry_history_id: number|null|undefined = 0;

    // Conexão com o banco de dados
    const client = await pool.connect();

    try{

        // Início da transação
        await client.query('BEGIN');

        // Adiciona produto, retornando id do produto adicionado e verificando se a adição foi bem sucedida
        product_id  = (await client.query(dbQueryAddProduct, [inSchema.name, inSchema.value, 
            inSchema.description, inSchema.quantity, inSchema.category, inSchema.img_url, inSchema.bar_code])).rows[0]?.id;
        if(product_id === undefined){
            await client.query('ROLLBACK');
            return null;
        }

        /* 
            Registra produto adicionado no histórico de entrada, retornando id do histórico e verificando 
            se a adição foi bem sucedida
        */
        entry_history_id = (await client.query(dbQueryAddEntryHistorie, [product_id, inSchema.quantity])).rows[0]?.id;
        if(entry_history_id === undefined){
            await client.query('ROLLBACK');
            return null;
        }

        // Se tudo ocorreu bem, confirma a transação, retornando o id do produto adicionado
        returned = product_id;

        // Confirma a transação
        await client.query('COMMIT');
    }
    catch(error){

        // Em caso de erro, desfaz todas as querys realizadas
        await client.query('ROLLBACK');
        throw error;
    }
    finally{

        // Libera a conexão com o banco de dados
        client.release();
        
    }

    return returned;

}