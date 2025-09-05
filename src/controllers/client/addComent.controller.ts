import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addCommentInSchema } from "../../schemas/lojinha/input/addComentIn.schema";
import { addCommentData } from "../../repositories/client/addComentData.repository";

const addComment = async(req: Request, res: Response): Promise<void> => {

    // Verificação se o usuário está autenticado
    if(req.userId === undefined) throw new ApiError(404, "Usuário não encontrado");

    // Obtenção do body de requisição
    const body = addCommentInSchema.safeParse(req.body);

    // Verificação se o body está correto
    if(!body.success) throw new ApiError(400, body.error.message);

    // Adição do comentário no banco de dados
    const result = await addCommentData(req.userId, body.data);

    // Verificação se o comentário foi adicionado
    if(!result) throw new ApiError(404, 'Comentário não adicionado');

    // Resposta de sucesso
    res.status(200).json(result);

}

export default addComment;