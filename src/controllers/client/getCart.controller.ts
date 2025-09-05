import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getCartData } from "../../repositories/client/getCartData.repository";
import { getCartOutSchema } from "../../schemas/lojinha/output/getCartOut.schema";

const getCart = async(req: Request, res: Response): Promise<void> => {
    
    // Busca carrinho pelo status em conjunto com o id do usuário
    const userId = req.userId;
    
    // Verificação se id do usuário está disponível
    if(userId === undefined) throw new ApiError(404, 'Usuário não encontrado');
    
    // Busca carrinho pelo status('cart') e id do usuário
    const cart = await getCartData(userId);
    
    // Verificação se carrinho foi encontrado
    if(!cart || cart.items.length === 0) throw new ApiError(404, 'Carrinho vazio');
    
    // Validação do pedido a ser retornado
    const safedCart = getCartOutSchema.parse(cart); 
    
    // Retorno do pedido
    res.status(200).json(safedCart);

}

export default getCart