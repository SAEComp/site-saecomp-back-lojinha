import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetPunctuationPageInSchema } from "../../schemas/lojinha/input/getPunctuationPageIn.schema";
import { ICGetPunctuationPageOutSchema } from "../../schemas/lojinha/output/getPunctuationPageOut.schema";

export const getPunctuationPageData = async(punctuationConfigs: ICGetPunctuationPageInSchema): Promise<ICGetPunctuationPageOutSchema> => {
    
    // Extração dos parâmetros da busca de páginas de pontuações
    const { page, pageSize, name, minPunctuation, maxPunctuation } = punctuationConfigs;

    // Vetores para formação da query dinâmica
    const params: string[] = [];
    const values: any[] = [];

    // Verificação dos filtros opcionais
    if(name !== undefined && name.length > 0){
        params.push(`u.name ILIKE $${values.length + 1}`);
        values.push(`%${name}%`); // busca por nomes que possuem esse filtro adicional
    }
    if(minPunctuation !== undefined){
        params.push(`p.score >= $${values.length + 1}`);
        values.push(minPunctuation);
    }
    if(maxPunctuation !== undefined){
        params.push(`p.score <= $${values.length + 1}`);
        values.push(maxPunctuation);
    }

    // Query dinâmica de obtenção das páginas de pontuações
    let dbQueryGetPunctuationPage = `
        SELECT 
            p.user_id as "userId",
            p.score as "userPunctuation",
            u.name as "userName"
        FROM punctuations p
        INNER JOIN users u on p.user_id = u.id
    `;

    // Caso exista parâmetros, adiciona WHERE e parâmetros de procura na query
    if(values.length > 0) dbQueryGetPunctuationPage += ' WHERE ' + params.join(' AND ');
    
    // Ordenação das pontuações decrescentemente
    dbQueryGetPunctuationPage += ' ORDER BY p.score DESC ';

    // Definição da página de pontuações a ser retornada
    dbQueryGetPunctuationPage += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2} `;
    values.push(pageSize, pageSize * (page - 1));

    // Obtenção da página de pontuações
    const punctuation = (await pool.query(dbQueryGetPunctuationPage, values)).rows;
    if(!punctuation || punctuation.length == 0) throw new ApiError(404, 'Nenhuma pontuação encontrada'); 

    // Montagem do esquema de saída 
    const punctuationPage: ICGetPunctuationPageOutSchema = {
        punctuation: punctuation
    }

    // Retorno de página de pontuações
    return punctuationPage as ICGetPunctuationPageOutSchema;
};