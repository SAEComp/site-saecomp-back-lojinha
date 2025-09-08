import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getStatisticsInSchema, ICGetStatisticsInSchema } from "../../schemas/lojinha/input/getStatisticsIn.schema";
import { getStatisticsData } from "../../repositories/admin/getStatisticsData.repository";

const getStatistics = async(req: Request, res: Response): Promise<void> => {

    const query = getStatisticsInSchema.parse(req.query);

    const result = getStatisticsData(query);

    res.json(result);
}

export default getStatistics;