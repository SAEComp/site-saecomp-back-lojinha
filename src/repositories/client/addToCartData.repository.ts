import pool from "../../database/connection";

const dbQueryCreateBuyOrder = `
    INSERT INTO buy_orders (users_id, date, status)
    VALUES ($1, CURRENT_DATE, 'cart')
    ON CONLICT (users_id) DO NOTHING
`;

const dbQueryUpdateItems = `
    UPDATE items i
    SET quantity = $1 
    FROM buy_orders bo
    JOIN products p on i.products_id = p.id
    WHERE bo.users_id = $2
        AND i.buy_orders_id = bo.id
        AND i.products_id = $3
        AND p.soft_delete = false
`;

const dbQueryCreateOrder = `

`;

const addtoCartData = async(user_id: number, product_id: number, quantity: number): Promise<number|null> => {

    // Tenta criar nova ordem se ela não existir
    const row = await pool.query(dbQueryCreateBuyOrder, [user_id]);

    // Se a ordem foi criada agora 
    if(row.rowCount != 0){

    }

    // Busca produto dentro do carrinho do usuário
    const { rowCont } = await pool.query(dbQueryUpdateItems, [quantity, user_id, product_id]);
}