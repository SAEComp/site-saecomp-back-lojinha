import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICAddPixKeyInSchema } from "../../schemas/lojinha/input/addPixKeyIn.schema";
import verifyAccountToken from "../../services/verifyAccountToken";


const dbQueryDeletePixKey = `
    DELETE FROM pix_keys
`; 

const dbQueryAddPixKey = `
    INSERT INTO pix_keys (name, city, pix_key, token)
    VALUES($1, $2, $3, $4) 
    RETURNING id
`;

export const addPixKeyData = async (pixAccount: ICAddPixKeyInSchema):Promise<void> => {

    // Verificar se o token da conta pix é válido  
    const isTokenValid: boolean = await verifyAccountToken(pixAccount.tokenAccount);
    if(!isTokenValid){
        throw new ApiError(400, 'Token da conta pix inválido');
    }

    // abrir uma transação
    const client = await pool.connect();

    try{
        // Início de transação
        await client.query('BEGIN');

        // Apagar todas as chaves pix existentes
        await client.query(dbQueryDeletePixKey);

        // Adicionar a nova chave pix e verificar se foi adicionada
        const id:number = (await client.query(dbQueryAddPixKey, [pixAccount.nameAccount, pixAccount.cityAccount, pixAccount.pixKey, pixAccount.tokenAccount])).rows[0]?.id;
        if(!id) throw new ApiError(404, 'Erro na adição da chave pix');

        // Confirmar todas as operações realizadas na transação
        await client.query('COMMIT');
    }
    catch(error){

        // Em caso de erro, desfazer todas as operações realizadas na transação
        await client.query('ROLLBACK');
        throw error;
    }
    finally{
        // Finalizar a conexão com o banco de dados
        client.release();
    }
}