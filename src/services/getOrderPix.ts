import pool from "../database/connection";
import { ICPaymentData } from "../schemas/lojinha/output/finishBuyOut.schema";
import { MercadoPagoConfig, Payment } from "mercadopago"
import getAccountToken from "./getAccountToken";

const dbQueryInserPixPayment = `
    INSERT INTO pix_payments (buy_order_id, payment_id, qr_code, pix_copia_cola)
    VALUES ($1, $2, $3, $4)
`;

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
        external_reference: String(buyOrderId),
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

    // Criação do registro do pix no banco de dados
    const rowCount = (await pool.query(dbQueryInserPixPayment, [buyOrderId, String(payment.paymentId), payment.qrCodeBase64, payment.pixCopiaECola])).rowCount;
    if(rowCount === 0){
        throw new Error('Erro ao registrar pagamento pix no banco de dados');
    }

    // Retorno dos dados do pix
    return payment as ICPaymentData ;
};


export default getOrderPix;