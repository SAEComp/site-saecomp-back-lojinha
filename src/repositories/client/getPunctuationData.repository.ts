import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetPunctuationOutSchema } from "../../schemas/lojinha/output/getPunctuationOut.schema";

const dbQueryGetPunctuation = `
    SELECT 
        p.score as "userPunctuation",
        u.name as "userName"
    FROM punctuations p
    RIGHT JOIN users u ON u.id = p.user_id
    WHERE u.id = $1
`;

export const getPunctuationData = async(userId: number): Promise<ICGetPunctuationOutSchema> => {
    // Pontuação do usuário
    let punctuation: ICGetPunctuationOutSchema = {
        userName: "",
        userPunctuation: 0
    }

    // Obtenção da pontuação do usuário
    const row = (await pool.query(dbQueryGetPunctuation, [userId])).rows[0];

    // Verifica se o usuário existe, se não, lança um erro
    if(!row.userName) throw new ApiError(404, 'Usuário não encontrado');
    punctuation.userName = row.userName;

    // Verifica se o usuário possui pontuação, se não, ela permanece 0
    if(row.userPunctuation) punctuation.userPunctuation = row.userPunctuation;
    
    // Retorno da pontuação do usuário
    return punctuation ;
}