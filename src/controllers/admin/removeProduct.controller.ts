import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { removeProductInSchema } from "../../schemas/lojinha/input/removeProductIn.schema";
import { removeProductData } from "../../repositories/admin/removeProductData.repository";

const removeProduct = async(req: Request, res: Response): Promise<void> => {
 
    // Obtenção e validação dos dados de entrada
    const body = removeProductInSchema.parse(req.body);

    // Remoção do produto no banco de dados e obtenção da quantidade de produtos editados
    const qntRemoves = await removeProductData({product_id:body.product_id});

    // Se nenhum produto foi editado, lança um erro 404 (produto não encontrado)
    if(!qntRemoves) throw new ApiError(404, 'Produto não encontrado');

    // Resposta de sucesso
    res.status(200).json({message: 'Produto removido com sucesso'});
    
}

export default removeProduct;