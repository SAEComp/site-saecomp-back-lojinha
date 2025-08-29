import { Request, Response} from "express";
import { addtoCartData } from "../../repositories/client/addToCartData.repository";
import { addToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";
import { ApiError } from "../../errors/ApiError";

const addToCart = async(req: Request, res: Response): Promise<void> =>{
    try{

        const query =  await addToCartInSchema.parse(req.body);

        if(req.userId === undefined){
            throw new ApiError(404, "Usuário não encontrado");
        }

        const returned : number | null = await addtoCartData(req.userId, query.product_id, query.quantity)

        if(returned){
            res.status(400).json({ message: 'Quantidade solicitada maior que disponível' });          
            return;
        }

        res.status(200).json({message: 'Produto adicionado com sucesso no carrinho'});

    }catch(error){
        console.log(error);
        res.status(500).json({message: 'Erro interno no servidor'});
    }
} 

export default addToCart;