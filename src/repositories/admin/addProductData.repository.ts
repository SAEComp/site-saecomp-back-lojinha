import pool from "../../database/connection";
import { ICAddProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";
import { ICAddProductOutSchema } from "../../schemas/lojinha/output/addProductOut.schema";


const dbQueryAddEntryHistory = `
    INSERT INTO entry_histories (product_id, quantity, value)
    VALUES ($1, $2, $3)
    RETURNING id
`;

export const addProductData = async(inSchema: ICAddProductInSchema): Promise<ICAddProductOutSchema|null> => {
    
    // Variáveis de controle
    let returned: ICAddProductOutSchema|null = null;

    // Partes dinâmicas da query
    let columns: string[] = [];
    let indexs: string[] = [] ;
    let values: any[] = [];

    // Valores obrigatórios para a query
    columns = ['name', 'value', 'description', 'quantity', 'category'];
    indexs = ['$1', '$2', '$3', '$4', '$5'];
    values.push(inSchema.name, inSchema.value, inSchema.description, inSchema.quantity, inSchema.category);


    // Verifica se os parâmetros opcionais foram enviados, adicionando-os na query
    if(inSchema.imgUrl){
        columns.push('img_url');
        indexs.push('$' + (values.length + 1));
        values.push(inSchema.imgUrl);
    }
    if(inSchema.barCode){
        columns.push('bar_code');
        indexs.push('$' + (values.length + 1));
        values.push(inSchema.barCode);
    }

    // Query dinâmica para adicionar produto 
    const dbQueryAddProduct = `
        INSERT INTO products (${columns.join(', ')})
        VALUES (${indexs.join(', ')})
        ON CONFLICT (bar_code) DO NOTHING
        RETURNING id
    `;

    // Conexão com o banco de dados
    const client = await pool.connect();

    try{
        // Início da transação
        await client.query('BEGIN');

        // Adiciona produto, retornando id do produto adicionado e verificando se a adição foi bem sucedida
        const productId  = (await client.query(dbQueryAddProduct, values)).rows[0]?.id;
        if(!productId){
            await client.query('ROLLBACK');
            return null;
        }

        /* 
            Registra produto adicionado no histórico de entrada, retornando id do histórico e verificando 
            se a adição foi bem sucedida
        */
        const entryHistoryId = (await client.query(dbQueryAddEntryHistory, [productId, inSchema.quantity, inSchema.value])).rows[0]?.id;
        if(!entryHistoryId){
            await client.query('ROLLBACK');
            return null;
        }

        // Se tudo ocorreu bem, confirma a transação, retornando o id do produto adicionado
        returned = {
            productId: productId
        }

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