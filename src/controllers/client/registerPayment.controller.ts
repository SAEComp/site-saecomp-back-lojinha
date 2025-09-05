import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { registerPaymentInSchema } from "../../schemas/lojinha/input/registerPaymentIn.schema";
import { registerPaymentOutSchema } from "../../schemas/lojinha/output/registerPaymentOut.schema";
import { registerPaymentData } from "../../repositories/client/registerPaymentData.repository";

const registerPayment = async(req: Request, res: Response): Promise<void> =>{

    // Validação do schema de entrada
    const body = registerPaymentInSchema.parse(req.body);

    // Chamada da função de repositório
    const result = await registerPaymentData(body);
    
    // Checagem do resultado da função de repositório, para existência de pedido
    if(!result) throw new ApiError(404, 'Pedido inexistente');

    // Se existir, valida saída
    const safedResult = registerPaymentOutSchema.parse(result);
    
    // Resposta de sucesso
    res.status(200).json(safedResult);

};

export default registerPayment