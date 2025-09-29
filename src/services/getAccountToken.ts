import pool from "../database/connection";
import { ApiError } from "../errors/ApiError";

const dbQueryGetPixToken = `
    SELECT 
        token as "token" 
    FROM pix_keys
`;

const getAccountToken = async(): Promise<string> => {

    // Busca o token do pix cadastrado na base de dados
    const rows = (await pool.query(dbQueryGetPixToken)).rows;
    if(rows.length === 0) throw new ApiError(404, 'Nenhuma chave pix cadastrada na base de dados');
    if(rows.length > 1) throw new ApiError(404, 'Mais de uma chave pix cadastrada na base de dados');

    // Extração do token
    const token: string = rows[0].token;
    if(!token) throw new ApiError(404, 'Chave pix sem token de acesso');

    return token;
    
};

export default getAccountToken;




