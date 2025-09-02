import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addCommentInSchema } from "../../schemas/lojinha/input/addComentIn.schema";
import { addCommentData } from "../../repositories/client/addComentData.repository";

const addComment = async(req: Request, res: Response): Promise<void> => {
    try{
        // Verificação se o usuário está autenticado
        if(req.userId === undefined) throw new ApiError(404, "Usuário não encontrado");

        // Obtenção do corpo de requisição
        const body = addCommentInSchema.parse({ ...req.body, user_id: req.userId}); 

        // Adição do comentário no banco de dados
        const commentId = await addCommentData({user_id: body.user_id, comment: body.comment});

        // Verificação se o comentário foi adicionado
        if(!commentId) throw new ApiError(404, 'Comentário não adicionado');

        // Resposta de sucesso
        res.status(200).json({message: 'Comentário adicionado com sucesso'});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Erro interno no servidor'});
    }
}

export default addComment;