import { Request, Response} from "express";
import { Product } from "../../interfaces/product.interface";
import { getProductPageDataWithoutCategory, getProductPageDataWithCategory } from "../../repositories/client/getProductPageData.repository";
import { getProductPageInSchema } from "../../schemas/lojinha/input/getProductPageIn.schema";
import { getProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";

const getProductPage = async(req: Request, res: Response): Promise<void> => {
    try{
        var products : Product [];
        
        const query = await getProductPageInSchema.parse(req.query);
        
        if(query.category == undefined){
            products = await getProductPageDataWithoutCategory({page: query.page, pageSize: query.pageSize});
        }
        else{
            products = await getProductPageDataWithCategory({page: query.page, pageSize: query.pageSize, category: query.category});
        }
        
        if(!products){
            res.status(404).json({message: 'Produtos não encontrados'});
            return ;
        }
        
        const safedProducts = getProductOutSchema.parse(products); 

        res.status(200).json(safedProducts)

    } catch(error){
        
        console.log(error);
        res.status(500).json({message: 'Erro interno do servidor'});
    }
}

export default getProductPage;