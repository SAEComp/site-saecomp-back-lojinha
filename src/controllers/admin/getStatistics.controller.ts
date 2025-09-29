import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getStatisticsInSchema } from "../../schemas/lojinha/input/getStatisticsIn.schema";
import { getStatisticsData } from "../../repositories/admin/getStatisticsData.repository";
import { getStatisticsOutSchema } from "../../schemas/lojinha/output/getStatisticsOut.schema";

const getStatistics = async(req: Request, res: Response): Promise<void> => {

    // Obtenção e validação dos parâmetros de consulta
    const query = getStatisticsInSchema.parse(req.query);

    // Obtenção das estatísticas
    const statistics = await getStatisticsData(query);
    
    // Verificação se as estatísticas foram obtidas com sucesso
    if(!statistics)
        throw new ApiError(404,"Erro ao obter as estatísticas");

    // Validação e envio da resposta
    const safeStatistics = getStatisticsOutSchema.parse(statistics);

    // Envio da resposta com as estatísticas
    res.status(200).json(safeStatistics);
}

export default getStatistics;