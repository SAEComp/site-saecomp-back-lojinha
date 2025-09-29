import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { ICGetPixKeyOutSchema } from "../../schemas/lojinha/output/getPixKeyOut.schema";
import { getPixKeyOutSchema } from "../../schemas/lojinha/output/getPixKeyOut.schema";
import { getPixKeyData } from "../../repositories/admin/getPixKeyData.repository";

const getPixKey = async(req: Request, res: Response): Promise<void> => {

    // Busca a chave pix no banco de dados
    const pixKeyAccount: ICGetPixKeyOutSchema = await getPixKeyData();

    // Valida a chave pix e retorna
    const safePixKeyAccount = getPixKeyOutSchema.parse(pixKeyAccount);

    // Retorna a chave pix
    res.status(200).json(safePixKeyAccount)
};

export default getPixKey;