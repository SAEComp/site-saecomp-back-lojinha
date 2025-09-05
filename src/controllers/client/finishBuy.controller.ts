import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { finishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { finishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { ICFinishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { finishBuyData } from "../../repositories/client/finishBuyData.repository";

const finishBuy = async(req: Request, res: Response): Promise<void> => {
 
    // Validação do schema de entrada
    const body = finishBuyInSchema.safeParse(req.body);
    if(!body.success) throw new ApiError(400, body.error.message);
    
    const result = await finishBuyData(body.data);
    
    // Checagem do resultado da função de repositório, para existência de pedido
    if(!result) throw new ApiError(404, 'Pedido não vazio ou inexistente');

    // Checagem do resultado da função de repositório, para existência de produtos com quantidade insuficiente
    if(result < 0) throw new ApiError(404, `Produdo ${-result} em quantidade insuficiente`);
    
    
    // verificação de pix para retorno
    
    // Se tudo ocorrer bem, o resultado inclui o valor total do pedido e os dados para pagamento via pix
    const outSchema : ICFinishBuyOutSchema = {
        totalValue: result,
        // TODO: Add paymentData with qrCodeBase64 and pixCopiaECola when available
    }

    // Validação do schema de saída
    const safedOutSchema = finishBuyOutSchema.parse(outSchema);

    // Resposta de sucesso
    res.status(200).json(safedOutSchema);

};

export default finishBuy;