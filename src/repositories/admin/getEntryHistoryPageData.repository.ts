import pool from "../../database/connection";
import { ICGetEntryHistoryPageInSchema } from "../../schemas/lojinha/input/getEntryHistoryPageIn.schema";
import { ICGetEntryHistoryPageOutSchema } from "../../schemas/lojinha/output/getEntryHistoryPageOut.schema";

export const getEntryHistoryPageData = async (pageSettings: ICGetEntryHistoryPageInSchema): Promise<ICGetEntryHistoryPageOutSchema> => {
  
    // Desestrutura os parâmetros de entrada
    const { page, pageSize, productName, value, quantity, dateMin, dateMax } = pageSettings;

    // Monta filtros dinâmicos
    const filters: string[] = [];
    const params: any[] = [];

    // Adiciona filtros conforme os parâmetros fornecidos
    if(productName !== undefined) {
        // Usa ILIKE para busca case-insensitive e parcial
        filters.push("p.name ILIKE $" + (params.length + 1));
        params.push(`%${productName}%`);
    }
    if(value !== undefined) {
        filters.push("eh.value = $" + (params.length + 1));
        params.push(value);
    }
    if(quantity !== undefined) { // pode ser inicialmente zero
        filters.push("eh.quantity = $" + (params.length + 1));
        params.push(quantity);
    }
    if(dateMin !== undefined) {
        filters.push("eh.date >= $" + (params.length + 1));
        params.push(dateMin);
    }
    if(dateMax !== undefined){
        filters.push("eh.date <= $" + (params.length + 1));
        params.push(dateMax);
    }

    // Monta a query base
    let dbQueryGetEntryHistoryPage = `
    SELECT
        eh.id AS "id",
        eh.product_id AS "productId",
        p.name AS "productName",
        eh.value AS "value",
        eh.quantity AS "quantity",
        eh.date AS "date"
    FROM entry_histories eh
    INNER JOIN products p ON eh.product_id = p.id
    `;

    // Adiciona filtros se existirem
    if (filters.length > 0) {
        dbQueryGetEntryHistoryPage += " WHERE " + filters.join(" AND ");
    }

    // Adiciona ordenação por data decrescente
    dbQueryGetEntryHistoryPage += ` 
    ORDER BY eh.date DESC`;
    
    // Adiciona índices de paginação
    dbQueryGetEntryHistoryPage += `
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `;

    // Adiciona parâmetros de paginação (página e tamanho da página)
    params.push(pageSize, (page - 1) * pageSize);

    // Executa a query com filtros e paginação
    const entryHistoryPage: ICGetEntryHistoryPageOutSchema = { 
        entryHistory: (await pool.query(dbQueryGetEntryHistoryPage, params)).rows
    };

    // Retorna os dados
    return entryHistoryPage;
};