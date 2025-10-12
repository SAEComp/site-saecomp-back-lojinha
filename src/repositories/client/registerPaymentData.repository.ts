import pool from "../../database/connection"; 
import { ICRegisterPaymentInSchema } from "../../schemas/lojinha/input/registerPaymentIn.schema";
import { ICRegisterPaymentOutSchema } from "../../schemas/lojinha/output/registerPaymentOut.schema";
import { ApiError } from "../../errors/ApiError";

const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'finishedPayment', "date" = CURRENT_TIMESTAMP
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
    UPDATE punctuations
    SET score = $1
    WHERE user_id = $2
`;

const dbQueryCreateUserPunctuation = `
    INSERT INTO punctuations (user_id, score)
    VALUES ($1, $2)
`;

export const registerPaymentData = async(orderKey: ICRegisterPaymentInSchema): Promise<ICRegisterPaymentOutSchema> => {
    
    // Variável de retorno
    let returned : ICRegisterPaymentOutSchema;

    // Conexão com o banco
    const client = await pool.connect();

    try{
        // Início da transação
        await client.query('BEGIN');

        // Atualização do status do pedido, se estiver como "pendingPayment"
        const userId = (await client.query(dbQuerySetBuyOrderToFinalized, [orderKey.buyOrderId])).rows[0]?.userId;
        if(!userId){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'Pedido não encontrado ou já finalizado');
        }

        // Cálculo do valor total gasto pelo usuário 
        const totalValue = (await client.query(dbQueryGetTotalValueOfOrder, [orderKey.buyOrderId])).rows[0]?.totalValue;
        if(!totalValue){
            await client.query('ROLLBACK');
            throw new ApiError(404, 'O pedido não possui itens válidos');
        }

        // 1 real <=> 100 pontos
        const score : number = Number((totalValue * 100).toFixed(0));

        // Atualização da pontuação do usuário
        const qntPunctuationUpdate = (await client.query(dbQueryUpdateUserScore, [score, userId])).rowCount;
        
        // Se não houver pontuação, cria uma nova
        if(!qntPunctuationUpdate){
            
            const qntCreatedPunctuation = (await client.query(dbQueryCreateUserPunctuation, [userId, score])).rowCount;
            if(!qntCreatedPunctuation){
                await client.query('ROLLBACK');
                throw new ApiError(404, 'Não foi possível atualizar a pontuação do usuário');
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