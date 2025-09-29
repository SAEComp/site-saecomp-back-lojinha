import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICFinishBuyInSchema } from "../../schemas/lojinha/input/finishBuyIn.schema";
import { ICPaymentData } from "../../schemas/lojinha/output/finishBuyOut.schema";
import { MercadoPagoConfig, Payment } from "mercadopago"


const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'pendingPayment', "date" = CURRENT_DATE
    WHERE id = $1
`;

const dbQuerySearchItemsInBuyOrder = `
    SELECT 
        i.id AS "id",
        i.quantity AS "quantity",
        i.product_id AS "productId",
        i.value AS "value"
    FROM items i
    JOIN products p ON i.product_id = p.id
    WHERE i.buy_order_id = $1
        AND p.soft_delete = false 
`;

const dbQueryUpdateProductAfterFinishedBuyOrder = `
    UPDATE products
    SET quantity = quantity - $1
    WHERE id = $2
        AND quantity >= $1
`;


export const finishBuyData = async(buyKey: ICFinishBuyInSchema): Promise<number> =>{

    // Valor total como variável de retorno
    let buyOrderValue: number = 0;
    
    // Início da transação
    const client = await pool.connect();

    try{

        // Comando para iniciar a transação
        await client.query('BEGIN');

        // Atualização do status do pedido, se não encontrar o pedido, retorna null
        const qntUpdatedBuyOrders = (await client.query(dbQuerySetBuyOrderToFinalized, [buyKey.buyOrderId])).rowCount;
        if(!qntUpdatedBuyOrders){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Pedido não encontrado');
        }

        // Busca os itens do pedido, se não encontrar nenhum item, retorna null
        const items: any[] = (await client.query(dbQuerySearchItemsInBuyOrder, [buyKey.buyOrderId])).rows;
        if(items.length === 0){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'O pedido não possui itens válidos');
        }

        // Atualiza a quantidade dos produtos no estoque, se não conseguir atualizar algum produto, retorna o id do produto negativo
        for(var i: number = 0; i < items.length; i++){
            
            const qntUpdatedProducts = (await client.query(dbQueryUpdateProductAfterFinishedBuyOrder, [items[i].quantity, items[i].productId])).rowCount;
            if(!qntUpdatedProducts){
                await client.query('ROLLBACK');
                throw new ApiError(404, `Produto ${items[i].productId} em quantidade insuficiente`);
            }
            
            buyOrderValue += (items[i].value * items[i].quantity);
        }
        if(buyOrderValue <= 0){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Pedido vazio ou inexistente');
        }

        // Comando para finalizar a transação
        await client.query('COMMIT');
    }
    catch(error){

        // Em caso de erro, desfaz a transação
        await client.query('ROLLBACK');
        
        // Lança o erro para ser tratado no controller
        throw error;

    }
    finally{

        // Libera o cliente de volta para o pool
        client.release();

    }

    // Retorna valor total do pedido
    return buyOrderValue;
};

const dbQueryGetUserEmail = `
    SELECT 
        email as "email" 
    FROM users
    WHERE id = $1
`;

export const getUserEmailData = async(userID: number): Promise<string> => {

    // Busca o email do usuário na base de dados e valida sua existência
    const email = (await pool.query(dbQueryGetUserEmail, [userID])).rows[0]?.email;
    if(!email || email.length == 0) 
        throw new ApiError(404, `Email de usuário ${userID} não encontrado`);

    // Retorna o email do usuário
    return email;
};

const dbQueryGetPixToken = `
    SELECT 
        token as "token" 
    FROM pix_keys
`;

export const getPixData = async(buyKey: ICFinishBuyInSchema, buyOrderValue: number, userEmail: string): Promise<ICPaymentData> => {

    // Busca o token do pix cadastrado na base de dados
    const rows = (await pool.query(dbQueryGetPixToken)).rows;
    if(rows.length === 0) throw new ApiError(404, 'Nenhuma chave pix cadastrada na base de dados');
    if(rows.length > 1) throw new ApiError(500, 'Mais de uma chave pix cadastrada na base de dados');

    // Extração do token
    const token: string = rows[0].token;
    if(!token) throw new ApiError(404, 'Erro interno, tente novamente mais tarde');

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
        external_reference: "LOJINHA-" + String(buyKey.buyOrderId),
        date_of_expiration: new Date(Date.now() + 1800000).toISOString(), // expira em 30 minutos
    };

    // Tentativa de criação do pagamento
    // Criação do pagamento
    const pixPayment = await paymentAPI.create({body});

    // Obtenção dos dados do pix
    const pix = {
        paymentId: pixPayment?.id,
        pixCopiaECola: pixPayment.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: pixPayment.point_of_interaction?.transaction_data?.qr_code_base64,
    };

    // Retorno dos dados do pix
    return pix as ICPaymentData ;
    
};




