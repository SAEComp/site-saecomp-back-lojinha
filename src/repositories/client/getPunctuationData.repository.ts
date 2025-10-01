import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetPunctuationOutSchema } from "../../schemas/lojinha/output/getPunctuationOut.schema";

const dbQueryGetPunctuation = `
    SELECT 
        p.score as "userPunctuation",
        u.name as "userName"
    FROM punctuations p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.id = $1
`;

export const getPunctuationData = async(userId: number): Promise<ICGetPunctuationOutSchema> => {
    // Obtenção da pontuação do usuário
    const punctuation = (await pool.query(dbQueryGetPunctuation, [userId])).rows[0];
    if(punctuation.userPunctuation === undefined || !punctuation.userName)
        throw new ApiError(404, 'Pontuação do usuário não encontrada');

    // Retorno da pontuação do usuário
    return punctuation as ICGetPunctuationOutSchema;
}