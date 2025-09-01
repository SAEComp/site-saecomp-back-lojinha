import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { editProductInSchema } from "../../schemas/lojinha/input/editProductIn.schema";
import { editProductData } from "../../repositories/admin/editProductData.repository";

const editProduct = async(req: Request, res: Response): Promise<void> => {
    try{
        const body = editProductInSchema.parse(req.body);

        const qntEdits = await editProductData({id:body.id, name: body.name, value: body.value, description:body.description, quantity: body.quantity, category: body.category, img_url: body.img_url, bar_code: body.bar_code});

        if(!qntEdits) throw new ApiError(404, 'Produto não encontrado');

        res.status(200).json({message: 'Produto editado com sucesso'});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Erro interno no servidor'});
    }
}

export default editProduct;