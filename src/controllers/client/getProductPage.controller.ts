import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getProductPageDataWithoutCategory, getProductPageDataWithCategory } from "../../repositories/client/getProductPageData.repository";
import { getProductPageInSchema } from "../../schemas/lojinha/input/getProductPageIn.schema";
import { getProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";
import { ICGetProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";

const getProductPage = async(req: Request, res: Response): Promise<void> => {
    try{
        // Vetor de produtos a serem retornados na requisição
        var products : ICGetProductOutSchema [];
        
        // Obtenção da query enviada na requisição
        const query = await getProductPageInSchema.parse(req.query);
        
        // Obtém página de produtos (com ou sem especificação de categoria)
        if(query.category == undefined){
            products = await getProductPageDataWithoutCategory({page: query.page, pageSize: query.pageSize});
        }
        else{
            products = await getProductPageDataWithCategory({page: query.page, pageSize: query.pageSize, category: query.category});
        }
        
        // Verifica se há produtos a serem retornados
        if(!products || products.length === 0){
            throw new ApiError(404, 'Nenhum produto encontrado');
        }
        
        // Valida os produtos obtidos com o schema de saída
        const safedProducts = getProductOutSchema.array().parse(products); 

        // Retorna produtos validados
        res.status(200).json(safedProducts)

    } catch(error){
        
        console.log(error);
        res.status(500).json({message: 'Erro interno do servidor'});
    }
}

export default getProductPage;