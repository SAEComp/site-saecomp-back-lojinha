import {Request, Response} from 'express';
import { getPunctuationPageData } from '../../repositories/admin/getPunctuationPageData.repository';
import { getPunctuationPageInSchema } from '../../schemas/lojinha/input/getPunctuationPageIn.schema';
import { getPunctuationPageOutSchema, ICGetPunctuationPageOutSchema } from '../../schemas/lojinha/output/getPunctuationPageOut.schema';


const getPunctuationPage = async(req: Request, res: Response): Promise<void> =>{

};

export default getPunctuationPage;