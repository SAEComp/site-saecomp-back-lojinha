import pool from "../../database/connection";
import { ICEditProductInSchema } from "../../schemas/lojinha/input/editProductIn.schema";


export const editProductData = async(inSchema: ICEditProductInSchema): Promise<number|null> =>{
    
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
        updateIndex.push('value = $' + (values.length + 1));
        values.push(inSchema.value);
    }
    if(inSchema.description !== undefined){
        updateIndex.push('description = $' + (values.length + 1));
        values.push(inSchema.description);
    }
    if(inSchema.quantity !== undefined){
        updateIndex.push('quantity = $' + (values.length + 1));
        values.push(inSchema.quantity);
    }
    if(inSchema.bar_code !== undefined){
        updateIndex.push('bar_code = $' + (values.length + 1));
        values.push(inSchema.bar_code ?? null);
    }
    if(inSchema.img_url !== undefined){
        updateIndex.push('img_url = $' + (values.length + 1));
        values.push(inSchema.img_url);
    }
    if(inSchema.category !== undefined){
        updateIndex.push('category = $' + (values.length + 1));
        values.push(inSchema.category);
    }

    // Se não houver campos para atualizar, retorna null
    if(updateIndex.length == 0) return null;

    // Adiciona o id ao final dos valores para a cláusula WHERE
    const idParamIndex: number = values.length + 1;
    values.push(inSchema.id); 

    // Query de atualização dinâmica
    const dbQueryEditProduct = `
        UPDATE products
        SET ${updateIndex.join(', ')}
        WHEN id = ${idParamIndex}
    `;

    // Executa a query e retorna o número de linhas afetadas
    const rowsCount = (await pool.query(dbQueryEditProduct, values)).rowCount;

    // Se nenhuma linha foi afetada, retorna null (produto não encontrado)
    return rowsCount;

}
