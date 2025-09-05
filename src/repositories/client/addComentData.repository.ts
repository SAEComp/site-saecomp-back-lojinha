import pool from "../../database/connection";
import { ICAddCommentInSchema } from "../../schemas/lojinha/input/addComentIn.schema";
import { ICAddCommentOutSchema } from "../../schemas/lojinha/output/addCommentOut.schema";

const dbQueryAddCommentData = `
    INSERT INTO comments (user_id, content)
    VALUES ($1, $2)
    RETURNING id
`;

export const addCommentData = async(userId: number, addedComment: ICAddCommentInSchema): Promise<ICAddCommentOutSchema|undefined> => {

    // Adiciona o comentário no banco de dados
    const id  = (await pool.query(dbQueryAddCommentData, [userId, addedComment.comment])).rows[0]?.id;
    
    // Se não conseguiu adicionar, retorna undefined
    if(!id) return undefined;

    // Inclusão do id do comentário adicionado no resultado
    const result: ICAddCommentOutSchema = {
        commentId: id
    }

    // Retorno do resultado
    return result;
}

