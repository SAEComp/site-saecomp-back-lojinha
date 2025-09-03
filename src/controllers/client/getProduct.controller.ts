import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getProductDataByBarCode, getProductDataById } from "../../repositories/client/getProductData.repository";
import { getProductInSchema } from "../../schemas/lojinha/input/getProductIn.schema";
import { getProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";
import { ICGetProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";

const getProduct = async(req: Request, res: Response): Promise<void> => {

    // Produto a ser retornado
    let product : ICGetProductOutSchema | undefined;
    
    // Validação de query de entrada
    const query = await getProductInSchema.parse(req.query);
    
    // Verificação de parâmetros passados na query são válidos
    if((!query.bar_code && !query.product_id) || (query.bar_code && query.product_id)){
        throw new ApiError(404, 'Parâmetros inválidos');
        return ;
    }

    // Busca produto pelo código de barras
    if(query.bar_code != undefined){
        product = await getProductDataByBarCode({bar_code: query.bar_code});
    }
    
    // Busca produto pelo id
    if(query.product_id != undefined){
        product = await getProductDataById({product_id: query.product_id});
    }
    
    // Produto não encontrado
    if(!product){
        throw new ApiError(404, 'Produto não encontrado');
        return ;
    }
    
    // Validação do produto a ser retornado
    const safedProduct = getProductOutSchema.parse(product); 
    
    // Retorno do produto
    res.status(200).json(safedProduct)

}

export default getProduct