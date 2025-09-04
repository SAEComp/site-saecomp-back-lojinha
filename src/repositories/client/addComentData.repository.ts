import pool from "../../database/connection";
import { ICAddCommentInSchema } from "../../schemas/lojinha/input/addComentIn.schema";
import { ICAddCommentOutSchema } from "../../schemas/lojinha/output/addCommentOut.schema";

const dbQueryAddComentData = `
    INSERT INTO comments (user_id, content)
    VALUES ($1, $2)
    RETURNING id
`;

export const addCommentData = async(userId: number,inSchema: ICAddCommentInSchema): Promise<ICAddCommentOutSchema|undefined> => {

    // Adiciona o comentário no banco de dados
    const id  = (await pool.query(dbQueryAddComentData, [userId, inSchema.comment])).rows[0]?.id;
    
    // Se não conseguiu adicionar, retorna undefined
    if(!id) return undefined;

    // Inclusão do id do comentário adicionado no resulta1do
    const result: ICAddCommentOutSchema = {
        commentId: id
    }

    // Retorno do resultado
    return result;
}

