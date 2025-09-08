import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { deleteItemInSchema } from "../../schemas/lojinha/input/deleteItemIn.schema";
import { deleteItemData } from "../../repositories/client/deleteItemData.repository";

const deleteItem = async(req: Request, res: Response): Promise<void> =>{
    
    // Validação do query de entrada
    const query =  deleteItemInSchema.parse(req.query);

    // Verificação se o usuário está autenticado
    if(req.userId === undefined) throw new ApiError(404, "Usuário não encontrado");
    
    // Remove produto do carrinho
    const qntDeletedItems  = await deleteItemData(req.userId, query);

    // Verificação se o produto foi adicionado ao carrinho
    if(!qntDeletedItems) throw new ApiError(404, 'Erro ao deletar item do carrinho');
    
    // Retorno de sucesso
    res.status(200).json({message: 'Item deletado do carrinho com sucesso'});
    
} 

export default deleteItem;