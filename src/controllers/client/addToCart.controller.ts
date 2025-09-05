import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addtoCartData } from "../../repositories/client/addToCartData.repository";
import { addToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";

const addToCart = async(req: Request, res: Response): Promise<void> =>{
    
    // Validação do body de entrada
    const body =  addToCartInSchema.parse(req.body);
    
    // Verificação se o usuário está autenticado
    if(req.userId === undefined) throw new ApiError(404, "Usuário não encontrado");
    
    // Adiciona produto ao carrinho
    const cartId  = await addtoCartData(req.userId, body);

    // Verificação se o produto foi adicionado ao carrinho
    if(!cartId) throw new ApiError(500, 'Erro ao adicionar produto no carrinho');
    
    // Retorno de sucesso
    res.status(200).json(cartId);
    
} 

export default addToCart;