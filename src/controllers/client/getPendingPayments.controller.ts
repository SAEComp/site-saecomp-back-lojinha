import { Request, Response } from "express";
import { ApiError } from "../../errors/ApiError";
import { getPendingPaymentOutSchema } from "../../schemas/lojinha/output/getPendingPaymentsOut.schema";
import { getPendingPaymentsData } from "../../repositories/client/getPendingPaymentsData.repository";


const getPendingPayments = async (req: Request, res: Response) => {
    
    // Obtém o ID do usuário a partir do middleware de autenticação
    const userId = req.userId;
    if(!userId) throw new ApiError(404, "Usuário não encontrado");

    // Obtém os pedidos pendentes de pagamento do repositório
    const pendingPayments = await getPendingPaymentsData(userId);
    
    // Valida e sanitiza os dados usando o esquema Zod
    const safedPendingPayments = getPendingPaymentOutSchema.parse(pendingPayments);

    // Retorna os dados validados e sanitizados
    res.status(200).json(safedPendingPayments);
};

export default getPendingPayments;