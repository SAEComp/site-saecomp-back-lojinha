import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getProductPageData } from "../../repositories/client/getProductPageData.repository";
import { getProductPageInSchema } from "../../schemas/lojinha/input/getProductPageIn.schema";
import { getProductPageOutSchema } from "../../schemas/lojinha/output/getProductPageOut.schema";
import { ICGetProductPageOutSchema } from "../../schemas/lojinha/output/getProductPageOut.schema";

const getProductPage = async(req: Request, res: Response): Promise<void> => {
    
    // Obtenção da query enviada na requisição
    const query = getProductPageInSchema.parse(req.query);
    
    // Obtém página de produtos (com ou sem especificação de categoria)
    const page: ICGetProductPageOutSchema = await getProductPageData(query); 

    // Valida os produtos obtidos com o schema de saída
    const safedPage = getProductPageOutSchema.parse(page); 

    // Retorna produtos validados
    res.status(200).json(safedPage);

}

export default getProductPage;