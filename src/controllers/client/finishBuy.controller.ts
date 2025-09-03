import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { finishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { finishBuyData } from "../../repositories/client/finishBuyData.repository";

const finishBuy = async(req: Request, res: Response): Promise<void> => {
 
    // Validação do schema de entrada
    const body = finishBuyInSchema.parse(req.body);
    
    // Chamada da função de repositório
    const result = await finishBuyData({buy_order_id: body.buy_order_id});
    
    // Checagem do resultado da função de repositório, para existência de pedido
    if(!result) throw new ApiError(404, 'Pedido não vazio ou inexistente');

    // Checagem do resultado da função de repositório, para existência de produtos com quantidade insuficiente
    if(result < 0) throw new ApiError(404, `Produdo ${-result} em quantidade insuficiente`);
    
    // Resposta de sucesso
    res.status(200).json({message: 'Finalização de pedido bem sucedida'});

};

export default finishBuy;