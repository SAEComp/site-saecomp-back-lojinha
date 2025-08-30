import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addtoCartData } from "../../repositories/client/addToCartData.repository";
import { addToCartInSchema } from "../../schemas/lojinha/input/addToCartIn.schema";

const addToCart = async(req: Request, res: Response): Promise<void> =>{
    try{
        // Validação do body de entrada
        const query =  await addToCartInSchema.parse(req.body);

        // Verificação se o usuário está autenticado
        if(req.userId === undefined){
            throw new ApiError(404, "Usuário não encontrado");
        }

        // Adiciona produto ao carrinho
        const returned : number | null = await addtoCartData(req.userId, query.product_id, query.quantity)

        // Verifica se a quantidade solicitada é maior que a disponível em estoque
        if(!returned){
            throw new ApiError(404, 'Quantidade solicitada maior que a disponível em estoque');          
            return;
        }

        // Retorno de sucesso
        res.status(200).json({message: 'Produto adicionado com sucesso no carrinho'});

    }catch(error){
        console.log(error);
        res.status(500).json({message: 'Erro interno no servidor'});
    }
} 

export default addToCart;