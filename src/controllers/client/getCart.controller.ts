import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getCartData } from "../../repositories/client/getCartData.repository";
import { getCartOutSchema } from "../../schemas/lojinha/output/getCartOut.schema";
import { ICGetCartOutSchema } from "../../schemas/lojinha/output/getCartOut.schema"; 

const getCart = async(req: Request, res: Response): Promise<void> => {

    // Pedido a ser retornado
    let buyOrder : ICGetCartOutSchema | undefined;
    
    // Busca carrinho pelo status em conjunto com o id do usuário
    const userId = req.userId;
    
    // Verificação se id do usuário está disponível
    if(userId === undefined){
        throw new ApiError(404, 'Usuário não encontrado');
    }
    
    // Busca pedido pelo status e id do usuário
    buyOrder = await getCartData(userId);
    
    // Verificação se pedido foi encontrado
    if(!buyOrder){
        throw new ApiError(404, 'Produto não encontrado');
    }
    
    // Validação do pedido a ser retornado
    const safedBuyOrder = getCartOutSchema.parse(buyOrder); 
    
    // Retorno do pedido
    res.status(200).json(safedBuyOrder);

}

export default getCart