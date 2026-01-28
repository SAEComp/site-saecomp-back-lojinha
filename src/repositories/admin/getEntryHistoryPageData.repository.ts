import pool from "../../database/connection";
import { ICGetEntryHistoryPageInSchema } from "../../schemas/lojinha/input/getEntryHistoryPageIn.schema";
import { ICGetEntryHistoryPageOutSchema } from "../../schemas/lojinha/output/getEntryHistoryPageOut.schema";

export const getEntryHistoryPageData = async (pageSettings: ICGetEntryHistoryPageInSchema): Promise<ICGetEntryHistoryPageOutSchema> => {
  
    // Desestrutura os parâmetros de entrada
    const { page, pageSize, productName, minValue, maxValue, minQuantity, maxQuantity, dateMin, dateMax } = pageSettings;

    // Monta filtros dinâmicos
    const filters: string[] = [];
    const params: any[] = [];

    // Adiciona filtros conforme os parâmetros fornecidos
    if(productName !== undefined) {
        // Usa ILIKE para busca case-insensitive e parcial
        filters.push("p.name ILIKE $" + (params.length + 1));
        params.push(`%${productName}%`);
    }
    if(minValue !== undefined) {
        filters.push("eh.value >= $" + (params.length + 1));
        params.push(minValue);
    }
    if(maxValue !== undefined) {
        filters.push("eh.value <= $" + (params.length + 1));
        params.push(maxValue);
    }
    if(minQuantity !== undefined) { // pode ser inicialmente zero
        filters.push("eh.quantity >= $" + (params.length + 1));
        params.push(minQuantity);
    }
    if(maxQuantity !== undefined) { // pode ser inicialmente zero
        filters.push("eh.quantity <= $" + (params.length + 1));
        params.push(maxQuantity);
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

    // Obtém os dados da página de histórico de entradas
    const entryHistory = (await pool.query(dbQueryGetEntryHistoryPage, params)).rows

    // Monta o esquema de saída
    const entryHistoryPage: ICGetEntryHistoryPageOutSchema = { 
        entryHistory: entryHistory
    };

    // Retorna os dados
    return entryHistoryPage;
};