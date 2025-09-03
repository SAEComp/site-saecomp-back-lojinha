import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getBuyOrderDataById, getBuyOrderDataByStatus } from "../../repositories/client/getBuyOrderData.repository";
import { getBuyOrderInSchema } from "../../schemas/lojinha/input/getBuyOrderIn.schema";
import { getBuyOrderOutSchema } from "../../schemas/lojinha/output/getBuyOrderOut.schema";
import { ICGetBuyOrderOutSchema } from "../../schemas/lojinha/output/getBuyOrderOut.schema"; 

const getBuyOrder = async(req: Request, res: Response): Promise<void> => {
    try{
        // Pedido a ser retornado
        let buyOrder : ICGetBuyOrderOutSchema | undefined;
        
        // Validação de query de entrada
        const query =  getBuyOrderInSchema.parse(req.query);
        
        // Verificação se parâmetros passados na query são válidos
        if((!query.status && !query.buy_order_id) || (query.status && query.buy_order_id)){
            throw new ApiError(404, 'Parâmetros inválidos');
        }

        // Busca pedido pelo status em conjunto com o id do usuário
        if(query.status !== undefined){

            const userId = req.userId;
            
            // Verificação se id do usuário está disponível
            if(userId === undefined){
                throw new ApiError(404, 'Usuário não encontrado');
            }
            
            // Busca pedido pelo status e id do usuário
            buyOrder = await getBuyOrderDataByStatus(userId, {status: query.status});
        }
        
        // Busca pedido pelo próprio id
        if(query.buy_order_id !== undefined){
            buyOrder = await getBuyOrderDataById({buy_order_id: query.buy_order_id});
        }
        
        // Verificação se pedido foi encontrado
        if(!buyOrder){
            throw new ApiError(404, 'Produto não encontrado');
        }
        
        // Validação do pedido a ser retornado
        const safedBuyOrder = getBuyOrderOutSchema.parse(buyOrder); 
        
        // Retorno do pedido
        res.status(200).json(safedBuyOrder);

    } catch(error){
        
        // Tratamento de erros
        console.log(error);

        // Erro de validação
        res.status(500).json({message: 'Erro interno do servidor'});
    }
}

export default getBuyOrder