import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getBuyOrderPageData } from "../../repositories/admin/getBuyOrderPageData.repository";
import { getBuyOrderPageInSchema } from "../../schemas/lojinha/input/getBuyOrderPageIn.schema";
import { getBuyOrderPageOutSchema, ICGetBuyOrderPageOutSchema } from "../../schemas/lojinha/output/getBuyOrderPageOut.schema";

const getBuyOrderPage = async(req: Request, res: Response): Promise<void> => {

    // Vetor de produtos a serem retornados na requisição
    let buyOrderPage : ICGetBuyOrderPageOutSchema;
    
    // Obtenção da query enviada na requisição
    const query = getBuyOrderPageInSchema.safeParse(req.query);

    if(query.success === false) throw new ApiError(400, 'Erro na validação da query');
    
    // Obtém página de produtos (com ou sem especificação de categoria)
    buyOrderPage = await getBuyOrderPageData(query.data);
   
    // Verifica se há produtos a serem retornados
    if(!buyOrderPage || buyOrderPage.buyOrders.length === 0) 
        throw new ApiError(404, 'Nenhum pedido encontrado');
    
    // Valida os produtos obtidos com o schema de saída
    const safedBuyOrderPage = getBuyOrderPageOutSchema.safeParse(buyOrderPage);
    
    if(safedBuyOrderPage.success === false) 
        throw new ApiError(500, 'Erro na validação dos dados de saída');

    // Retorna produtos validados
    res.status(200).json(safedBuyOrderPage)

}

export default getBuyOrderPage;