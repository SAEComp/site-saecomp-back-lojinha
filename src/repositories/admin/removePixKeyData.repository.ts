import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";

const dbQueryDeletePixKey = `
    DELETE FROM pix_keys
`;

export const removePixKeyData = async ():Promise<void> =>{
    
    // Removendo a chave pix
    const rowCount = (await pool.query(dbQueryDeletePixKey)).rowCount;
    
    // Se não houver chave pix, lança um erro 404
    if(!rowCount) throw new ApiError(404, 'Nenhuma chave pix encontrada');
};