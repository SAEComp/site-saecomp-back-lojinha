import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICAddProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";
import { ICAddProductOutSchema } from "../../schemas/lojinha/output/addProductOut.schema";


const dbQueryAddEntryHistory = `
    INSERT INTO entry_histories (product_id, quantity, value)
    VALUES ($1, $2, $3)
    RETURNING id
`;

export const addProductData = async(product: ICAddProductInSchema): Promise<ICAddProductOutSchema|null> => {
    
    // Variável de retorno
    let returned: ICAddProductOutSchema|null = null;

    // Partes dinâmicas da query
    let columns: string[] = [];
    let indexs: string[] = [] ;
    let values: any[] = [];

    // Valores obrigatórios para a query
    columns = ['name', 'value', 'description', 'quantity', 'category'];
    indexs = ['$1', '$2', '$3', '$4', '$5'];
    values.push(product.name, product.value, product.description, product.quantity, product.category);


    // Verifica se os parâmetros opcionais foram enviados, adicionando-os na query
    if(product.imgUrl){
        columns.push('img_url');
        indexs.push('$' + (values.length + 1));
        values.push(product.imgUrl);
    }
    if(product.barCode){
        columns.push('bar_code');
        indexs.push('$' + (values.length + 1));
        values.push(product.barCode);
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
            throw new ApiError(404, 'Não foi possível adicionar o produto (código de barras já existente)');
        }

        /* 
            Registra produto adicionado no histórico de entrada, retornando id do histórico e verificando 
            se a adição foi bem sucedida
        */
        const entryHistoryId = (await client.query(dbQueryAddEntryHistory, [productId, product.quantity, product.value])).rows[0]?.id;
        if(!entryHistoryId){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Não foi possível registrar o histórico de entrada do produto');
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