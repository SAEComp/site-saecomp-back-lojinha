import pool from "../../database/connection"; 
import { ICRegisterPaymentInSchema } from "../../schemas/lojinha/input/registerPaymentIn.schema";
import { ICRegisterPaymentOutSchema } from "../../schemas/lojinha/output/registerPaymentOut.schema";

const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'finishedPayment', "date" = CURRENT_DATE
    WHERE 
        id = $1
        AND status = 'pendingPayment'
    RETURNING user_id AS "userId"
`;

const dbQueryGetTotalValueOfOrder = `
    SELECT 
        COALESCE(SUM(quantity * value), 0) AS "totalValue"
    FROM items
    WHERE buy_order_id = $1
`;

const dbQueryUpdateUserScore = `
    UPDATE punctuation
    SET score = $1
    WHERE user_id = $2
`;

const dbQueryCreateUserPonctuation = `
    INSERT INTO punctuation (user_id, score)
    VALUES ($1, $2)
    RETURNING id
`;

export const registerPaymentData = async(inSchema: ICRegisterPaymentInSchema): Promise<ICRegisterPaymentOutSchema|null> => {
    
    // Variáveis de controle
    let userId : number|undefined = 0
    let totalValue : number|undefined = 0;
    let qntPunctuationUpdate : number|null = 0;
    let ponctuationId : number|undefined = 0;
    let score : number = 0;

    // Variável de retorno
    let returned : ICRegisterPaymentOutSchema|null = null;

    // Conexão com o banco
    const client = await pool.connect();

    try{
        // Início da transação
        await client.query('BEGIN');

        // Atualização do status do pedido, se estiver como "pendingPayment"
        userId = (await client.query(dbQuerySetBuyOrderToFinalized, [inSchema.buyOrderId])).rows[0]?.userId;
        if(!userId){
            await client.query('ROLLBACK');
            return null;
        }

        // Cálculo do valor total gasto pelo usuário 
        totalValue = (await client.query(dbQueryGetTotalValueOfOrder, [inSchema.buyOrderId])).rows[0]?.totalValue;
        if(!totalValue){
            await client.query('ROLLBACK');
            return null;
        }

        // 1 real <=> 100 pontos
        score = totalValue * 100;

        // Atualização da pontuação do usuário
        qntPunctuationUpdate = (await client.query(dbQueryUpdateUserScore, [score, userId])).rowCount;
        
        // Se não houver pontuação, cria uma nova
        if(!qntPunctuationUpdate){
            
            ponctuationId = (await client.query(dbQueryCreateUserPonctuation, [userId, score])).rows[0]?.id;
            if(!ponctuationId){
                await client.query('ROLLBACK');
                return null;
            }
        }

        // Definição do objeto de retorno
        returned = {
            userScore: score
        };

        // Finalização da transação
        await client.query('COMMIT');
    }
    catch(error){

        // Em caso de erro, desfaz a transação
        await client.query('ROLLBACK');
        throw error;
    }
    finally{
        // Liberação do client
        client.release();
    }

    // Retorno do resultado
    return returned;
};