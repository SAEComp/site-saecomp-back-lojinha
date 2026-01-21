import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetStatisticsInSchema } from "../../schemas/lojinha/input/getStatisticsIn.schema";
import { ICGetStatisticsOutSchema } from "../../schemas/lojinha/output/getStatisticsOut.schema";

const dbQueryGetOrderStats = `
    SELECT 
        COUNT(id) FILTER (WHERE status != 'cart') AS "totalOrders",
        COUNT(id) FILTER (WHERE status = 'finishedPayment') AS "finishedOrders",
        COUNT(id) FILTER (WHERE status = 'canceled') AS "canceledOrders"
    FROM buy_orders
`;

const dbQueryGetProductsStats = `
    SELECT 
        COUNT(id) FILTER (WHERE soft_delete = false) AS "stockProducts",
        SUM(quantity * value) FILTER (WHERE soft_delete = false) AS "maxPotentialRevenue" 
    FROM products
`;

const dbQueryGetTotalRevenueAndSoldItems = `
    SELECT 
        SUM(i.quantity * i.value) AS "totalRevenueValue",
        SUM(i.quantity) AS "soldItems"
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
        SUM(i.quantity * i.value) AS "revenueValue"
    FROM products p
    INNER JOIN items i ON i.product_id = p.id
    INNER JOIN buy_orders bo ON i.buy_order_id = bo.id
    WHERE 
        p.soft_delete = false
        AND bo.status = 'finishedPayment'
    GROUP BY p.id, p.name
    ORDER BY SUM(i.quantity * i.value) DESC
    LIMIT $1 OFFSET 0
`;

const dbQueryProductsWithMoreSolds = `
    SELECT
        p.id AS "id",
        p.name AS "name",
        SUM(i.quantity) AS "soldQuantity",
        SUM(i.quantity * i.value) AS "revenueValue"
    FROM products p
    INNER JOIN items i ON i.product_id = p.id
    INNER JOIN buy_orders bo ON i.buy_order_id = bo.id
    WHERE 
        p.soft_delete = false
        AND bo.status = 'finishedPayment'
    GROUP BY p.id, p.name
    ORDER BY SUM(i.quantity) DESC
    LIMIT $1 OFFSET 0
`;


export const getStatisticsData = async(statisticsInfo: ICGetStatisticsInSchema): Promise<ICGetStatisticsOutSchema> => {

    // Desestruturação dos parâmetros de entrada
    const { moreRevenueQnt, moreSoldQnt} = statisticsInfo;

    // Variável de resultado
    let statistics : ICGetStatisticsOutSchema; 

    // Início da conexão com o banco
    const client = await pool.connect();

    try{
        // Comando para iniciar a transação
        await client.query('BEGIN');

        // Obtenção das estatísticas de pedidos e verificação de erros
        const queryGetOrderStats = (await client.query(dbQueryGetOrderStats));
        statistics = queryGetOrderStats.rows[0] || {totalOrders: 0, finishedOrders: 0, canceledOrders: 0};

        // Obtenção das estatísticas de produtos e verificação de erros
        const queryGetProductsStats = (await client.query(dbQueryGetProductsStats));
        statistics = {...statistics, ...queryGetProductsStats.rows[0] || {stockProducts: 0, stockItems: 0}};

        // Obtenção das estatísticas de receita e verificação de erros
        const queryGetRevenue = (await client.query(dbQueryGetTotalRevenueAndSoldItems));
        statistics = {...statistics, ...queryGetRevenue.rows[0] || {totalRevenueValue: 0, soldItems: 0}};

        // Obtenção dos produtos com mais receita, e verificação de erros
        const queryProductsWithMoreRevenue = (await client.query(dbQueryProductsWithMoreRevenue, [moreRevenueQnt]));
        statistics.productsWithMoreRevenueValue = queryProductsWithMoreRevenue.rows || [];

        // Obtenção dos produtos com mais vendas, e verificação de erros
        const queryProductsWithMoreSolds = (await client.query(dbQueryProductsWithMoreSolds, [moreSoldQnt]));
        statistics.productsWithMoreSoldQuantity = queryProductsWithMoreSolds.rows || [];
        
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

    // Retorna as estatísticas obtidas
    return statistics as ICGetStatisticsOutSchema;
}