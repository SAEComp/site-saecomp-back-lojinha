import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getEntryHistoryPageInSchema } from "../../schemas/lojinha/input/getEntryHistoryPageIn.schema";
import { getEntryHistoryPageData } from "../../repositories/admin/getEntryHistoryPageData.repository";
import { getEntryHistoryPageOutSchema } from "../../schemas/lojinha/output/getEntryHistoryPageOut.schema";

const getEntryHistoryPage = async (req: Request, res: Response) => {

    // Validação dos dados de entrada
    const query = getEntryHistoryPageInSchema.parse(req.query);


    // Obtenção dos página de histórico de entradas
    const outData = await getEntryHistoryPageData(query);

    // Verificação se há dados a serem retornados
    if(!outData || outData.entryHistory.length === 0) 
        throw new ApiError(404, 'Nenhum histórico de entrada encontrado');
    
    // Validação dos dados de saída
    const safedOutData = getEntryHistoryPageOutSchema.parse(outData);

    // Retorno dos dados
    res.status(200).json(safedOutData);

}

export default getEntryHistoryPage;