import e, { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { removePixKeyData } from "../../repositories/admin/removePixKeyData.repository";

const removePixKey = async(req: Request, res: Response): Promise<void> => {

    // Removendo a chave pix
    await removePixKeyData();

    // Retornando sucesso
    res.status(200).json({message: 'Chave removida com sucesso'});
};

export default removePixKey;