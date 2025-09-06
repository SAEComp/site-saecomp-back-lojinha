import pool from "../../database/connection";
import { ICGetBuyOrderPageInSchema } from "../../schemas/lojinha/input/getBuyOrderPageIn.schema";
import { ICGetBuyOrderPageOutSchema } from "../../schemas/lojinha/output/getBuyOrderPageOut.schema";

export const getBuyOrderPageData = async (pageSettings: ICGetBuyOrderPageInSchema): Promise<ICGetBuyOrderPageOutSchema> => {

    // Desestrutura os parâmetros de entrada
    const {
        page,
        pageSize,
        status,
        productName,
        userName,
        totalValueMin,
        totalValueMax,
        dateMin,
        dateMax
    } = pageSettings;

    // Filtros dinâmicos opcionais
    const filters: string[] = [];

    // Parâmetros para query
    const params: any[] = [];

    // Filtros dinâmicos
    if (status) {
        filters.push("bo.status = $" + (params.length + 1));
        params.push(status);
    }
    if (productName && productName.length > 0) {

        // // Garante que productName é um array
        var namesArray = Array.isArray(productName) ? productName : [productName];
        
        // //  Cria um filtro para cada nome de produto
        const nameFilters = namesArray.map((_, i) => `p.name ILIKE $${params.length + i + 1}`);
       
        // // Agrupa os filtros de nome com OR
        filters.push(`(${nameFilters.join(" OR ")})`);

        // Adiciona parametros separdos para cada nome, case insensitive
        params.push(...namesArray.map(n => `%${n}%`));
    }
    if (userName && userName.trim() !== "") {
        // Using ILIKE for case-insensitive search
        filters.push("u.name ILIKE $" + (params.length + 1));
        params.push(`%${userName}%`);
    }
    if (dateMin) {
        filters.push("bo.date >= $" + (params.length + 1));
        params.push(dateMin);
    }
    if (dateMax) {
        filters.push("bo.date <= $" + (params.length + 1));
        params.push(dateMax);
    }

    // Monta a query base para pedidos
    let query = `
        SELECT
            bo.id AS "id",
            u.name AS "userName",
            bo.date AS "date",
            bo.status AS "status",
            COALESCE(SUM(i.value * i.quantity), 0) AS "totalValue"
        FROM buy_orders bo
        INNER JOIN users u ON bo.user_id = u.id
        LEFT JOIN items i ON bo.id = i.buy_order_id
        LEFT JOIN products p ON i.product_id = p.id
    `;


    // Adiciona filtros opicionai caso estejam presentes na requisição
    if (filters.length > 0) {
        query += " WHERE " + filters.join(" AND ");

        // Pedidos em estado de carrinho são desconsiderados
        query += " AND bo.status != 'cart' ";
    } 
    else {
        query += " WHERE bo.status != 'cart' ";
    }

    // Agrupamento para filtragem utilizando valores totais
    query += " GROUP BY bo.id, u.name, bo.date, bo.status ";

    // Filtro para garantir que todos os nomes de produtos estejam presentes no pedido
    if(productName && Array.isArray(productName) && productName.length > 0) {
        query += `HAVING COUNT(DISTINCT p.name) = ${productName.length} `;
    }

    // Filtros de totalValue mínimo e máximo
    if (totalValueMin !== undefined) {
        query += ` HAVING COALESCE(SUM(i.value * i.quantity), 0) >= $${params.length + 1}`;
        params.push(totalValueMin);
    }
    if (totalValueMax !== undefined) {
        query += totalValueMin !== undefined ? 
        ` AND COALESCE(SUM(i.value * i.quantity), 0) <= $${params.length + 1}`
        : ` HAVING COALESCE(SUM(i.value * i.quantity), 0) <= $${params.length + 1}`;
        params.push(totalValueMax);
    }

    // Ordenação, paginação( com página e tamanho da página)
    query += `
        ORDER BY bo.date DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
    `;
    params.push(pageSize, (page - 1) * pageSize);

    // Obtenção da lista de pedidos
    const orders = (await pool.query(query, params)).rows;

    // Lista e itens dos pedidos
    let items: any[] = [];
    
    // Se não houver pedidos, evita consulta desnecessária
    if (orders.length > 0) {

        // Extrai IDs dos pedidos para buscar itens
        const orderIds = orders.map(o => o.id);

        // Query para buscar itens dos pedidos, sem uma associação direta com os pedidos (em ordem de eficiência)
        const itemsQuery = `
            SELECT
                i.buy_order_id AS "buyOrderId",
                p.name AS "productName",
                i.quantity AS "quantity",
                i.value AS "value"
            FROM items i
            INNER JOIN products p ON i.product_id = p.id
            WHERE i.buy_order_id = ANY($1)
        `;

        // Obtém da lista de itens dos pedidos
        items = (await pool.query(itemsQuery, [orderIds])).rows;        
    }

    // Mapea saída conforme o esquema de saída
    const buyOrders: ICGetBuyOrderPageOutSchema = { 
        buyOrder: orders.map(order => ({

            id: order.id,
            userName: order.userName,
            date: order.date,
            status: order.status,
            totalValue: Number(order.totalValue),

            // Filtra itens pertencentes ao pedido atual (já que a query de itens não está associada diretamente a um pedido específico)
            item: items.filter(item => item.buyOrderId == order.id).map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    value: item.value
            }))
        }))
    };

    return buyOrders;
};