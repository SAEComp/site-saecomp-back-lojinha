import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addtoCartData } from "../../repositories/client/addToCartData.repository";
import { addToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";

const addToCart = async(req: Request, res: Response): Promise<void> =>{
    
    // Validação do body de entrada
    const body =  await addToCartInSchema.parse(req.body);

    // Verificação se o usuário está autenticado
    if(req.userId === undefined){
        throw new ApiError(404, "Usuário não encontrado");
    }

    // Adiciona produto ao carrinho
    const result : number | null = await addtoCartData(req.userId, {product_id: body.product_id, quantity: body.quantity});

    // Verifica se a quantidade solicitada é maior que a disponível em estoque
    if(!result){
        throw new ApiError(404, 'Quantidade solicitada maior que a disponível em estoque');          
    }

    // Retorno de sucesso
    res.status(200).json({message: 'Produto adicionado com sucesso no carrinho'});
    
} 

export default addToCart;