import { Request, Response} from "express";
import { Product } from "../../interfaces/product.interface";
import { getProductDataByBarCode, getProductDataById } from "../../repositories/client/getProductData.repository";
import { getProductInSchema } from "../../schemas/lojinha/input/getProductIn.schema";
import { getProductOutSchema } from "../../schemas/lojinha/output/getProductOut.schema";

const getProduct = async(req: Request, res: Response): Promise<void> => {
        try{
            var product : Product|null;
            
            const query = await getProductInSchema.parse(req.query);
            
            if(query.bar_code != undefined){
                product = await getProductDataByBarCode(query.bar_code);
            }
            else if(query.product_id != undefined){
                product = await getProductDataById(query.product_id);
            }
            else{
                res.status(500).json({message: 'Nenhum parâmetro passado'});
                return ;
            }
            
            if(!product){
                res.status(404).json({message: 'Produto não encontrados'});
                return ;
            }
            
            const safedProduct = getProductOutSchema.parse(product); 
    
            res.status(200).json(safedProduct)
    
        } catch(error){
            
            console.log(error);
            res.status(500).json({message: 'Erro interno do servidor'});
        }
}

export default getProduct