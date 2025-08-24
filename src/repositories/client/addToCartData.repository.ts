import pool from "../../database/connection";

const dbQueryUpdateItems = `
    update items i
    set quantity = $1 
    from buy_orders bo
    join products p on bo.products_id = $1
    where bo.user_id = $2
        and i.buy_orders_id = bo.id
        and p.soft_delete = false
`;

const dbQueryCreateOrder = '
';

const addtoCartData = async(user_id: number, product_id: number, quantity: number): Promise<number|null> => {
    const { rowCont } = pool.query(dbQueryCreateOrder, [quantity, user_id, ])
}