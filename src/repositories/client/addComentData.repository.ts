import pool from "../../database/connection";
import { ICAddCommentInSchema } from "../../schemas/lojinha/input/addComentIn.schema";

const dbQueryAddComentData = `
    INSERT INTO comments (user_id, content)
    VALUES ($1, $2)
    RETURNING id
`;

export const addCommentData = async(inSchema: ICAddCommentInSchema): Promise<number|undefined> => {

    // Adiciona o comentário no banco de dados
    const id  = (await pool.query(dbQueryAddComentData, [inSchema.user_id, inSchema.comment])).rows[0]?.id;
    
    // Retorna o id do comentário adicionado
    return id;
}

