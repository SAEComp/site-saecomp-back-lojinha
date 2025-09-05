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

const dbQueryCreateUserPunctuation = `
    INSERT INTO punctuation (user_id, score)
    VALUES ($1, $2)
    RETURNING id
`;

export const registerPaymentData = async(orderKey: ICRegisterPaymentInSchema): Promise<ICRegisterPaymentOutSchema|null> => {
    
    // Variável de retorno
    let returned : ICRegisterPaymentOutSchema|null = null;

    // Conexão com o banco
    const client = await pool.connect();

    try{
        // Início da transação
        await client.query('BEGIN');

        // Atualização do status do pedido, se estiver como "pendingPayment"
        const userId = (await client.query(dbQuerySetBuyOrderToFinalized, [orderKey.buyOrderId])).rows[0]?.userId;
        if(!userId){
            await client.query('ROLLBACK');
            return null;
        }

        // Cálculo do valor total gasto pelo usuário 
        const totalValue = (await client.query(dbQueryGetTotalValueOfOrder, [orderKey.buyOrderId])).rows[0]?.totalValue;
        if(!totalValue){
            await client.query('ROLLBACK');
            return null;
        }

        // 1 real <=> 100 pontos
        const score : number = totalValue * 100;

        // Atualização da pontuação do usuário
        const qntPunctuationUpdate = (await client.query(dbQueryUpdateUserScore, [score, userId])).rowCount;
        
        // Se não houver pontuação, cria uma nova
        if(!qntPunctuationUpdate){
            
            const punctuationId = (await client.query(dbQueryCreateUserPunctuation, [userId, score])).rows[0]?.id;
            if(!punctuationId){
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