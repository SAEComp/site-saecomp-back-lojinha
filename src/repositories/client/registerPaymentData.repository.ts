import pool from "../../database/connection"; 
import { ICRegisterPaymentInSchema } from "../../schemas/lojinha/input/registerPaymentIn.schema";

const dbQuerySetBuyOrderToFinalized = `
    UPDATE buy_orders
    SET status = 'finishedPayment', "date" = CURRENT_DATE
    WHERE id = $1
`;

export const registerPaymentData = async(inSchema: ICRegisterPaymentInSchema): Promise<number|null> => {
    
    // Atualiza o status do pedido para 'finishedPayment' e atualiza a data para a data atual
    const rowCount = (await pool.query(dbQuerySetBuyOrderToFinalized, [inSchema.buy_order_id])).rowCount;
    
    // Retorna o número de linhas afetadas (deve ser 1 se o pedido foi encontrado e atualizado, 0 se não encontrado)
    return rowCount;
};