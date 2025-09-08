import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getStatisticsOutSchema, ICGetStatisticsOutSchema } from "../../schemas/lojinha/output/getStatisticsOut.schema";
import { getStatisticsData } from "../../repositories/admin/getStatisticsData.repository";

const getStatistics = async(req: Request, res: Response): Promise<void> => {

}

export default getStatistics;