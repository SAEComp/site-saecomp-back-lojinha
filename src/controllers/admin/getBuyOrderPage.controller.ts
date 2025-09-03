import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getBuyOrderPageDataWithoutStatus, getBuyOrderPageDataWithStatus } from "../../repositories/admin/getBuyOrderPageData.repository";
import { getBuyOrderPageInSchema } from "../../schemas/lojinha/input/getBuyOrderPageIn.schema";
import { ICGetBuyOrderOutSchema, getBuyOrderOutSchema } from "../../schemas/lojinha/output/getBuyOrderOut.schema";

const getBuyOrderPage = async(req: Request, res: Response): Promise<void> => {

    // Vetor de produtos a serem retornados na requisição
    let buyOrderPage : ICGetBuyOrderOutSchema [];
    
    // Obtenção da query enviada na requisição
    const query = await getBuyOrderPageInSchema.parse(req.query);
    
    // Obtém página de produtos (com ou sem especificação de categoria)
    if(query.status == undefined){
        buyOrderPage = await getBuyOrderPageDataWithoutStatus({page: query.page, page_size: query.page_size});
    }
    else{
        buyOrderPage = await getBuyOrderPageDataWithStatus({page: query.page, page_size: query.page_size, status: query.status});
    }
    
    // Verifica se há produtos a serem retornados
    if(!buyOrderPage || buyOrderPage.length === 0){
        throw new ApiError(404, 'Nenhum pedido encontrado');
    }
    
    // Valida os produtos obtidos com o schema de saída
    const safedBuyOrderpage = getBuyOrderOutSchema.array().parse(buyOrderPage); 

    // Retorna produtos validados
    res.status(200).json(safedBuyOrderpage)

}

export default getBuyOrderPage;