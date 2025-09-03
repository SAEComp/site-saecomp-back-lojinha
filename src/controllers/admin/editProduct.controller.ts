import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { editProductInSchema } from "../../schemas/lojinha/input/editProductIn.schema";
import { editProductData } from "../../repositories/admin/editProductData.repository";

/* 
    Observe que quando a utilização do código de barras for eficientemente implementada,
    o código deverá ser adaptado para que exista uma edição via código de barras e uma edição
    via id do produto
*/
const editProduct = async(req: Request, res: Response): Promise<void> => {
 
    // Obtenção e validação dos dados de entrada
    const body = editProductInSchema.parse(req.body);

    // Edição do produto no banco de dados e obtenção da quantidade de produtos editados
    const qntEdits = await editProductData({product_id:body.product_id, bar_code: body.bar_code, name: body.name, value: body.value, description:body.description, quantity: body.quantity, category: body.category, img_url: body.img_url});

    // Se nenhum produto foi editado, lança um erro 404 (produto não encontrado)
    if(!qntEdits) throw new ApiError(404, 'Produto não encontrado');

    // Resposta de sucesso
    res.status(200).json({message: 'Produto editado com sucesso'});

}

export default editProduct;