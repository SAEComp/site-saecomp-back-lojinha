import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetStatisticsInSchema } from "../../schemas/lojinha/input/getStatisticsIn.schema";
import { ICGetStatisticsOutSchema } from "../../schemas/lojinha/output/getStatisticsOut.schema";
import { BuyOrder } from "../../interfaces/order.interface";
import { Item } from "../../interfaces/Item.interface";


const dbQueryGetOrderStats = `
    SELECT 
        COUNT(id) FILTER (WHERE status!='cart') AS "totalOrders",
        COUNT(id) FILTER (WHERE status = 'pendingPayment') AS "pendingOrders",
        COUNT(id) FILTER (WHERE status = 'finishedPayment') AS "finishedOrders",
        COUNT(id) FILTER (WHERE status = 'canceled') AS "canceledOrders"
    FROM buy_orders
`;

const dbQueryGetProductsStats= `
    SELECT 
        COUNT(id) FILTER (WHERE soft_delete = false) AS "stockProducts",
        SUM(products.value * products.quantity) AS "stockItems" 
    FROM products
`;

const dbQueryGetRevenue = `
    SELECT 
        SUM(i.quantity * i.value) AS "totalRevenueValue"
    FROM items i
    INNER JOIN buy_orders bo ON i.buy_order_id = bo.id
    WHERE
        bo.status = 'finishedPayment'
`;

const dbQueryProductsWithMoreRevenue = `
    SELECT
        p.id AS "id",
        p.name AS "name",
        SUM(i.quantity) AS "soldQuantity",
        SUM(i.quantity * i.value) AS "revenue"
    FROM products p
    INNER JOIN items i ON i.product_id = p.id
    WHERE p.soft_delete = false
    GROUP BY p.id, p.name
    ORDER BY SUM(i.quantity * i.value) DESC
`;

const dbQueryProductsWithMoreSolds = `
    SELECT
        p.id AS "id",
        p.name AS "name",
        SUM(i.quantity) AS "soldQuantity",
        SUM(i.quantity * i.value) AS "revenue"
    FROM products p
    INNER JOIN items i ON i.product_id = p.id
    WHERE p.soft_delete = false
    GROUP BY p.id, p.name
    ORDER BY SUM(i.quantity) DESC
`;


export const getStatisticsData = async(statisticsInfo: ICGetStatisticsInSchema): Promise<ICGetStatisticsOutSchema> => {

    const { lessSoldQnt, moreSoldQnt} = statisticsInfo;

    let result : ICGetStatisticsOutSchema; 

    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        result = (await client.query(dbQueryGetProductsStats)).rows[0];

        result = (await client.query(dbQueryGetProductsStats)).rows[0];

        result = (await client.query(dbQueryGetRevenue)).rows[0];

        result.productWithMoreRevenueValue = (await client.query(dbQueryProductsWithMoreRevenue)).rows[0];

        result.productWithMoreSoldQuantity = (await client.query(dbQueryProductsWithMoreSolds)).rows[0];
        
        await client.query('COMMIT');
    }
    catch(error){
        await client.query('ROLLBACK');
        throw error;
    }
    finally{
        client.release();
    }


    return {} as ICGetStatisticsOutSchema;
}