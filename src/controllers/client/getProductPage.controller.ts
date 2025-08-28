import { Request, Response} from "express";
import { Product } from "../../interfaces/product.interface";
import { getProductPageDataWithoutCategory, getProductPageDataWithCategory } from "../../repositories/client/getProductPageData.repository";
import { getProductPageInSchema } from "../../schemas/lojinha/input/getProductPageIn.schema";


const getProductPage = async(req: Request, res: Response): Promise<void> => {
    try{
        var Products : Product [];
        
        const query = await getProductPageInSchema.parse(req.query);
        
        if(query.category == undefined){
            Products = await getProductPageDataWithoutCategory({page: query.page, pageSize: query.pageSize});
        }
        else{
            Products = await getProductPageDataWithCategory({page: query.page, pageSize: query.pageSize, category: query.category});
        }

        if(!Products){
            res.status(404).json({message: 'Produtos não encontrados'});
            return ;
        }

    } catch(error){
        
        console.log(error);
        res.status(500).json({message: 'Erro interno do servidor'});
    }
}