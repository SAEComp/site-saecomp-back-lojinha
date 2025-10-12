import { Request, Response } from "express";
import { ApiError } from "../../errors/ApiError";
import { cancelPaymentInSchema } from "../../schemas/lojinha/input/cancelPaymentIn.schema";
import { cancelPaymentData } from "../../repositories/client/cancelPaymentData.repository";

const cancelPayment = async(req: Request, res: Response): Promise<void> =>{
    // Validação do corpo da requisição
    const body = cancelPaymentInSchema.parse(req.body);

    // Cancelamento do pagamento
    await cancelPaymentData(body);

    // Resposta de sucesso
    res.status(200).json({message: 'Pagamento cancelado com sucesso'});
};

export default cancelPayment;