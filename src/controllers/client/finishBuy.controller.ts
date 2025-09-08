import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { finishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { finishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { ICFinishBuyOutSchema } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { finishBuyData } from "../../repositories/client/finishBuyData.repository";
import { QrCodePix } from 'qrcode-pix';


const finishBuy = async(req: Request, res: Response): Promise<void> => {
 
    // Validação do schema de entrada
    const body = finishBuyInSchema.parse(req.body);
    
    // Finalização do pedido e obtenção do valor total
    const result = await finishBuyData(body);
    
    // Checagem do resultado da função de repositório, para existência de pedido
    if(!result) throw new ApiError(404, 'Pedido vazio ou inexistente');
    
    // Obtenção do valor total com duas casas decimais
    const safedValueOrder = Number(result.toFixed(2));
    
    // Obtenção do pix de pagamento para o valor do pedido
    const qrCodePix = QrCodePix({
        version: '01',
        key: '+5516992805111', 
        name: 'Lucas Augusto Moreira Barros',
        city: 'SAO CARLOS',
        message: 'Compra na Lojinha da SAECOMP',
        value: safedValueOrder,
    });
    
    // Se tudo ocorrer bem, o resultado inclui o valor total do pedido e os dados para pagamento via pix
    const outSchema : ICFinishBuyOutSchema = {
        totalValue: safedValueOrder,
        paymentData:{
            qrCodeBase64: await qrCodePix.base64(),  // url do tipo data:image/png;base64,.... para exibir o QR Code
            pixCopiaECola: qrCodePix.payload()       // string para o campo "copia e cola" do pix
        }
    }

    // Validação do schema de saída
    const safedOutSchema = finishBuyOutSchema.parse(outSchema);

    // Resposta de sucesso
    res.status(200).json(safedOutSchema);

};

export default finishBuy;