import pool from "../database/connection";
import { ApiError } from "../errors/ApiError";

const dbQueryGetUserEmail = `
    SELECT 
        email as "email" 
    FROM users
    WHERE id = $1
`;

const getUserEmail = async(userID: number): Promise<string> => {

    // Busca o email do usuário na base de dados e valida sua existência
    const email = (await pool.query(dbQueryGetUserEmail, [userID])).rows[0]?.email;
    if(!email || email.length == 0) 
        throw new ApiError(404, `Email de usuário ${userID} não encontrado`);

    // Retorna o email do usuário
    return email;
};

export default getUserEmail;