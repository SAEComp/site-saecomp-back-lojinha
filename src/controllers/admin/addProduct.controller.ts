import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addProductInSchema } from "../../schemas/lojinha/input/addProductIn.schema";
import { addProductData } from "../../repositories/admin/addProductData.repository";

const addProduct = async(req: Request, res: Response): Promise<void> => {
    try{

        // Obtém e valida o body de entrada
        const body = addProductInSchema.parse(req.body);

        // Adiciona produto ao banco de dados
        const product_id = await addProductData({name: body.name, value: body.value, description: body.description, quantity: body.quantity, category: body.category, img_url: body.img_url,bar_code: body.bar_code});
        
        // Verifica se o produto foi adicionado, e se não, retorna erro
        if(!product_id) throw new ApiError(404, 'Produto não adicionado');

        // Retorno de sucesso
        res.status(200).json({message: 'Produto adicionado com sucesso'});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Erro interno do servidor'});
    }
};

export default addProduct;