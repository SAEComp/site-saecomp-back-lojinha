import {Request, Response} from 'express';
import { getPunctuationPageData } from '../../repositories/admin/getPunctuationPageData.repository';
import { getPunctuationPageInSchema } from '../../schemas/lojinha/input/getPunctuationPageIn.schema';
import { getPunctuationPageOutSchema, ICGetPunctuationPageOutSchema } from '../../schemas/lojinha/output/getPunctuationPageOut.schema';


const getPunctuationPage = async(req: Request, res: Response): Promise<void> =>{
    // Validação e extração dos dados de entrada
    const query = getPunctuationPageInSchema.parse(req.query);
    
    // Obtenção da página de pontuações
    const punctuationPage = await getPunctuationPageData(query);

    // Validação dos dados de saída
    const safedPunctuationPage = getPunctuationPageOutSchema.parse(punctuationPage);

    // Retorno da página de pontuações
    res.status(200).json(safedPunctuationPage);
};

export default getPunctuationPage;