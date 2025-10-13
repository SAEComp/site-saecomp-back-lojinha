import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addtoCartData } from "../../repositories/client/addToCartData.repository";
import { addToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";

const addToCart = async(req: Request, res: Response): Promise<void> =>{
    
    // Validação do body de entrada
    const body =  addToCartInSchema.parse(req.body);
    
    // Verificação se o usuário está autenticado
    const userId = req.userId
    if(!userId) throw new ApiError(404, "Usuário não encontrado");
    
    // Adiciona produto ao carrinho
    const cartId  = await addtoCartData(userId, body);
    
    // Retorno de sucesso
    res.status(200).json(cartId);
    
} 

export default addToCart;