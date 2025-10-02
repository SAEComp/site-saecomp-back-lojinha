import {Request, Response} from 'express';
import { getPunctuationData } from '../../repositories/client/getPunctuationData.repository';
import { getPunctuationOutSchema } from '../../schemas/lojinha/output/getPunctuationOut.schema';
import { ApiError } from '../../errors/ApiError';

const getPunctuation = async(req: Request, res: Response): Promise<void> =>{
    // Validação do id do usuário
    const userId = req.userId;
    if(!userId) throw new ApiError(404, 'Id de usuário inválido');

    // Obtenção da pontuação do usuário
    const punctuation = await getPunctuationData(userId);

    // Validação dos dados de saída
    const safedPunctuation = getPunctuationOutSchema.parse(punctuation);

    // Retorno da pontuação do usuário
    res.status(200).json(safedPunctuation);
};

export default getPunctuation;