import {Request, Response} from "express";
import { ApiError } from "../errors/ApiError";
import { MercadoPagoConfig, Payment } from "mercadopago"
import getAccountToken from "./getAccountToken";


// Mapeamento hash com ID de Pagamento (chave) associado ao Objeto de Resposta do usuário (Res) envio de evento SSE.
export const waitingClients = new Map<number, Response>(); 

export const mercadoPagoWebhookEndpoint = async(topic: any, resourceId: any): Promise<void> =>{
    // Obtenção do token de acesso a conta
    const token = await getAccountToken();

    // Obtenção da conta mercado pago de recebimento de compras da lojinha
    const account = new MercadoPagoConfig({
        accessToken: token,
        options: {timeout: 5000}
    })

    // Obtenção da API de pagamento para a conta da lojinha
    const paymentAPI = new Payment(account);

    // Verificação se o tópico é de pagamento e se o id do recurso existe
    if(topic == 'payment' && resourceId){
        // Consulta o status do pagamento
        const paymentStatus = await paymentAPI.get({id: resourceId});
        
        // Extração do id do pagamento
        const paymentId = paymentStatus?.id;
        if(!paymentId) throw new ApiError(404, 'Erro na recepção do id de pagamento');
        
        // Verifica se o pagamento foi aprovado
        if(paymentStatus.status == 'approved'){
            // Verifica se existe algum cliente aguardando por verificação de pagamento
            const clientRes = waitingClients.get(paymentId);
            if(clientRes){
                // Se existir, envia o evento de pagamento aprovado
                clientRes.write('event: payment_approved\n');
                clientRes.write(`data: pagamento de pix de id ${paymentId} foi aprovado\n\n`);

                // Encerra a conexão SSE
                clientRes.end();

                // Remove o cliente da lista de espera
                waitingClients.delete(paymentId);
            }
        }
    }
};