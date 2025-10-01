import {Request, Response} from 'express';
import { getPunctuationData } from '../../repositories/client/getPunctuationData.repository';
import { getPunctuationInSchema } from '../../schemas/lojinha/input/getPunctuationIn.schema';
import { getPunctuationOutSchema, ICGetPunctuationOutSchema } from '../../schemas/lojinha/output/getPunctuationOut.schema';

const getPunctuation = async(req: Request, res: Response): Promise<void> =>{

};

export default getPunctuation;