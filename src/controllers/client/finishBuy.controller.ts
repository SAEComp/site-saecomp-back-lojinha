import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { finishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { finishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { ICFinishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { finishBuyData} from "../../repositories/client/finishBuyData.repository";
import getUserEmail from "../../services/getUserEmail";
import getOrderPix from "../../services/getOrderPix";


const finishBuy = async(req: Request, res: Response): Promise<void> => {
 
    // Validação do schema de entrada
    const body = finishBuyInSchema.parse(req.body);

    // Validação do usuário
    const userId = req.userId;
    if(userId === undefined) throw new ApiError(404, 'Usuário não encontrado');
    
    // Obtenção do email do usuário
    const userEmail = await getUserEmail(userId);    

    // Finalização do pedido e obtenção do valor total
    const buyOrderValue = await finishBuyData(body);
    
    // Obtenção dos dados do pix
    const paymentData = await getOrderPix(body.buyOrderId, buyOrderValue, userEmail);

    // Construção do schema de saída
    const outSchema: ICFinishBuyOutSchema = {
        totalValue: buyOrderValue,
        paymentData: paymentData
    };

    // Validação do schema de saída
    const safedOutSchema = finishBuyOutSchema.parse(outSchema);

    // Retorno do schema de saída
    res.status(200).json(safedOutSchema);

};

export default finishBuy;