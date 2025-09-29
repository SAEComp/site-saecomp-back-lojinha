import pool from "../database/connection";
import { ApiError } from "../errors/ApiError";
import { ICPaymentData } from "../schemas/lojinha/output/finishBuyOut.schema";
import { MercadoPagoConfig, Payment } from "mercadopago"
import getAccountToken from "./getAccountToken";



const getOrderPix = async(buyOrderId: number, buyOrderValue: number, userEmail: string): Promise<ICPaymentData> => {
    // obtenção do token da conta pix registrada
    const token = await getAccountToken();

    // Configuração de conta do mercado pago
    const account = new MercadoPagoConfig({
        accessToken: token,
        options: {timeout: 5000}
    });

    // Obtenção do pagamento para a conta da lojinha
    const paymentAPI = new Payment(account);

    // Corpo da requisição para o pix
    const body = {
        transaction_amount: buyOrderValue,
        description: 'Pagamento de teste pix lojinha', 
        payment_method_id: 'pix',
        payer: {email: userEmail},
        external_reference: "LOJINHA-" + String(buyOrderId),
        date_of_expiration: new Date(Date.now() + 1800000).toISOString(), // expira em 30 minutos
    };

    // Tentativa de criação do pagamento
    // Criação do pagamento
    const pixPayment = await paymentAPI.create({body});

    // Obtenção dos dados do pix
    const payment = {
        paymentId: pixPayment?.id,
        pixCopiaECola: pixPayment.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: pixPayment.point_of_interaction?.transaction_data?.qr_code_base64,
    };

    // Retorno dos dados do pix
    return payment as ICPaymentData ;
};


export default getOrderPix;