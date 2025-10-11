import {Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { mercadoPagoWebhookEndpoint } from "../../services/mercadoPagoWebhookEndpoint";


const confirmPayment = async(req: Request, res: Response): Promise<void> =>{

    // Extração do tópico e id do recurso da query ou do corpo da requisição
    const topic = req.query.topic || req.body.type;
    const resourceId = req.query.id || req.body.data?.id;

    // Informa o mercado pago que a requisição foi recebida
    res.sendStatus(200);

    // Chama o serviço que trata o webhook
    await mercadoPagoWebhookEndpoint(topic, resourceId);
    
};

export default confirmPayment;