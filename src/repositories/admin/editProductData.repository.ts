import pool from "../../database/connection";
import { ICEditProductInSchema } from "../../schemas/lojinha/input/editProductIn.schema";

const dbQueryGetOldProductQuantity = `
    SELECT 
        quantity AS "oldQuantity",
        value AS "oldValue" 
    FROM products 
    WHERE id = $1
`;

const dbQueryAddEntryHistorie = `
    INSERT INTO entry_histories (product_id, quantity, value)
    VALUES ($1, $2, $3)
    RETURNING id
`;


/* 
    Observe que quando a utilização do código de barras for eficientemente implementada,
    o código deverá ser adaptado para que exista uma edição via código de barras e uma edição
    via id do produto
*/
export const editProductData = async(inSchema: ICEditProductInSchema): Promise<number|null> =>{
    
    // Variáveis de controle
    let qntEditedProducts: number|null = 0;
    let entryHistoryId: number|undefined = 0;

    // Referência a valores a serem atualizados
    const updateIndex: String[] = [];

    // Valores para os quais as colunas serão atualizadas
    const values: any[] = [];

    // Construção dinâmica da query de atualização
    if(inSchema.name !== undefined){
        updateIndex.push('name = $' + (values.length + 1));
        values.push(inSchema.name);
    }
    if(inSchema.value !== undefined){
        updateIndex.push(' value = $' + (values.length + 1));
        values.push(inSchema.value);
    }
    if(inSchema.description !== undefined){
        updateIndex.push(' description = $' + (values.length + 1));
        values.push(inSchema.description);
    }
    if(inSchema.quantity !== undefined){
        updateIndex.push(' quantity = $' + (values.length + 1));
        values.push(inSchema.quantity);
    }
    if(inSchema.barCode !== undefined){
        updateIndex.push(' bar_code = $' + (values.length + 1));
        values.push(inSchema.barCode ?? null);
    }
    if(inSchema.imgUrl !== undefined){
        updateIndex.push(' img_url = $' + (values.length + 1));
        values.push(inSchema.imgUrl);
    }
    if(inSchema.category !== undefined){
        updateIndex.push(' category = $' + (values.length + 1));
        values.push(inSchema.category);
    }

    // Se não houver campos para atualizar, retorna null
    if(updateIndex.length == 0) return null;

    // Adiciona o id ao final dos valores para a cláusula WHERE
    const idParamIndex: number = values.length + 1;
    values.push(inSchema.productId); 

    // Query de atualização dinâmica
    const dbQueryEditProduct = `
        UPDATE products
        SET ${updateIndex.join(', ')}
        WHERE id = $${idParamIndex}
    `;
    
    // Conexão com o banco de dados
    const client = await pool.connect();

    try{
        // Início de transação
        await client.query('BEGIN');

        /* 
            Se a quantidade do produto foi atualizada, adiciona um registro na tabela entry_histories
            e verifica o sucesso da inserção
        */
        if(inSchema.quantity !== undefined){
           
            // Obtém a quantidade antiga do produto
            if(oldQuantity === undefined || oldQuantity === null || oldValue === undefined || oldValue === null){
               await client.query('ROLLBACK');
               return null;
            }
            
            // Se o valor do produto foi atualizado, utiliza o novo valor; caso contrário, utiliza o valor antigo
            const newValue: number = inSchema.value !== undefined ? inSchema.value : oldValue;
            
            // Obtenção de quantidade líquida (permite verificar roubos na loja física)
            const newQuantity: number = inSchema.quantity - oldQuantity;
                        
            // Obtem o id do registro de adição de produto inserido
            entryHistoryId = (await client.query(dbQueryAddEntryHistorie, [inSchema.productId, newQuantity, newValue])).rows[0]?.id
            
            // Verifica se a inserção foi bem sucedida
            if(!entryHistoryId){
                await client.query('ROLLBACK');
                return null;
            }
        }

        // Executa edição de produto, retorna o número de linhas afetadas e verificando sucesso da edição
        qntEditedProducts = (await client.query(dbQueryEditProduct, values)).rowCount;
        if(!qntEditedProducts){
            await client.query('ROLLBACK');
            return null;
        }
        
        // Confirma a transação
        await client.query('COMMIT');
    }
    catch(error){
        // Em caso de erro, desfaz a transação e relança o erro
        await client.query('ROLLBACK');
        throw error;
    }
    finally{

        // Liberação do cliente de volta ao pool
        client.release();
    }
    

    // Retorna a quantidade de produtos editados
    return qntEditedProducts;

}
