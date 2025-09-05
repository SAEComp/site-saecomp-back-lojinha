import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";
import { addProductOutSchema } from "../../schemas/lojinha/output/addProductOut.schema";
import { addProductData } from "../../repositories/admin/addProductData.repository";

const addProduct = async(req: Request, res: Response): Promise<void> => {

    // Obtém e valida o body de entrada
    const body = addProductInSchema.safeParse(req.body);
    if(!body.success) throw new ApiError(404, body.error.message);

    // Adiciona produto ao banco de dados
    const result = await addProductData(body.data);
    
    // Verifica se o produto foi adicionado, e se não, retorna erro
    if(!result) throw new ApiError(404, 'Produto não adicionado');

    // Valida o resultado antes de enviar a resposta
    const safedResult = addProductOutSchema.parse(result); 

    // Retorno de sucesso
    res.status(200).json(safedResult);

};

export default addProduct;