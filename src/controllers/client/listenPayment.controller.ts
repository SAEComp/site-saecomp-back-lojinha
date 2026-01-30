import { Request, Response } from 'express';
import { listenPaymentInSchema } from '../../schemas/lojinha/input/listenPaymentIn.schema';
import { waitingClients } from '../../services/mercadoPagoWebhookEndpoint';

const listenPayment = async(req: Request, res: Response): Promise<void> =>{

    // Obtém o ID do pagamento da query (ou params, conforme sua implementação)
    const query = listenPaymentInSchema.parse(req.query);
    const paymentId = query.paymentId;
    
    // Inicia a conexão SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Envia um evento de conexão inicial
    res.write('event: connected\n');
    res.write('data: Connected to payment events.\n\n');

    // Associa o ID do Pagamento ao objeto de Resposta (para enviar o evento depois)
    waitingClients.set(paymentId, res);
};

export default listenPayment;
 

