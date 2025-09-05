import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getBuyOrderPageData } from "../../repositories/admin/getBuyOrderPageData.repository";
import { getBuyOrderPageInSchema } from "../../schemas/lojinha/input/getBuyOrderPageIn.schema";
import { getBuyOrderPageOutSchema, ICGetBuyOrderPageOutSchema } from "../../schemas/lojinha/output/getBuyOrderPageOut.schema";

const getBuyOrderPage = async(req: Request, res: Response): Promise<void> => {

    // Vetor de produtos a serem retornados na requisição
    let buyOrderPage : ICGetBuyOrderPageOutSchema;
    
    // Obtenção da query enviada na requisição
    const query = getBuyOrderPageInSchema.parse(req.query);

    // Obtém página de produtos (com ou sem especificação de categoria)
    buyOrderPage = await getBuyOrderPageData(query);
   
    // Verifica se há produtos a serem retornados
    if(!buyOrderPage || buyOrderPage.buyOrder.length === 0) 
        throw new ApiError(404, 'Nenhum pedido encontrado');
    
    // Valida os produtos obtidos com o schema de saída
    const safedBuyOrderPage = getBuyOrderPageOutSchema.parse(buyOrderPage);

    // Retorna produtos validados
    res.status(200).json(safedBuyOrderPage)

}

export default getBuyOrderPage;