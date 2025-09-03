import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getEntryHistoryPageInSchema } from "../../schemas/lojinha/input/getEntryHistoryPageIn.schema";
import { getEntryHistoryPageData } from "../../repositories/admin/getEntryHistoryPageData.repository";

const getEntryHistoryPage = async (req: Request, res: Response) => {

    // Validação dos dados de entrada
    const query = getEntryHistoryPageInSchema.safeParse(req.query);

    // Tratamento de erro na validação
    if(!query.success) throw new ApiError( 400, query.error.message);

    // Obtenção dos página de histórico de entradas
    const outData = await getEntryHistoryPageData(query.data);

    // Verificação se há dados a serem retornados
    if(!outData || outData.length === 0) throw new ApiError(404, 'Nenhum histórico de entrada encontrado');
    
    // Retorno dos dados
    res.status(200).json(outData);

}

export default getEntryHistoryPage;