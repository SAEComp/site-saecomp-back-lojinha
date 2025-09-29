import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetPixKeyOutSchema } from "../../schemas/lojinha/output/getPixKeyOut.schema";

const dbQueryGetPixKey = `
    SELECT
        id as "id",
        name as "nameAccount",
        pix_key as "pixKey",
        city as "cityAccount",
        token as "tokenAccount"
    FROM pix_keys
`;

export const getPixKeyData = async (): Promise<ICGetPixKeyOutSchema> => {
    
    // Procura a chave pix no banco de dados e valida se existe apenas uma
    const rows = (await pool.query(dbQueryGetPixKey)).rows;
    if(rows.length == 0) throw new ApiError(404, 'Nenhuma chave pix no banco de dados');
    if(rows.length > 1) throw new ApiError(404, 'Mais de uma chave pix no banco de dados');

    // Extrai a chave pix retornada
    const pixAccount = rows[0];
    if(!pixAccount.id) throw new ApiError(404, 'Chave pix inválida');

    // Retorna a chave pix
    return pixAccount as ICGetPixKeyOutSchema
};