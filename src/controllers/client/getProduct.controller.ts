import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { getProductDataByBarCode, getProductDataById } from "../../repositories/client/getProductData.repository";
import { getProductInSchema } from "../../schemas/lojinha/input/getProductIn.schema";
import { getProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";
import { ICGetProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";

const getProduct = async(req: Request, res: Response): Promise<void> => {

    // Produto a ser retornado
    let product : ICGetProductOutSchema | undefined;
    
    // Obtém os parâmetros da query
    const query = getProductInSchema.safeParse(req.query);

    // Verificação de erros na query
    if(!query.success) throw new ApiError(404, query.error.message);

    // Obtençaõ de id de produto e/ou código de barras passado na query
    const {productId , barCode} = query.data;
    
    // Verificação de parâmetros passados na query são válidos
    if((!productId) && (!barCode)) throw new ApiError(404, 'Parâmetros inválidos');

    // Busca produto pelo código de barras
    if(barCode) product = await getProductDataByBarCode(query.data);
    
    // Busca produto pelo id
    if(productId) product = await getProductDataById(query.data);
    
    // Produto não encontrado
    if(!product) throw new ApiError(404, 'Produto não encontrado');

    // Validação do produto a ser retornado
    const safedProduct = getProductOutSchema.parse(product); 
    
    // Retorno do produto
    res.status(200).json(safedProduct)

}

export default getProduct