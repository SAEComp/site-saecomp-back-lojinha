import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { deleteCartData } from "../../repositories/client/deleteCartData.repository";

const deleteCart = async(req: Request, res: Response): Promise<void> =>{
    
    // Busca carrinho pelo status em conjunto com o id do usuário
    const userId = req.userId;
    
    // Verificação se id do usuário está disponível
    if(userId === undefined) throw new ApiError(404, 'Usuário não encontrado');
    
    // Busca carrinho pelo status('cart') e id do usuário
    const qntDeleted = await deleteCartData(userId);
    
    // Verificação se carrinho foi encontrado
    if(!qntDeleted) throw new ApiError(404, 'Erro ao deletar o carrinho ou carrinho inexistente'); 
    
    // Retorno do pedido
    res.status(200).json({message: 'Carrinho deletado com sucesso'});
    
} 

export default deleteCart;