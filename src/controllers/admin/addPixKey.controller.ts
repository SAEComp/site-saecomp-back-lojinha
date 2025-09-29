import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addPixKeyInSchema } from "../../schemas/lojinha/input/addPixKeyIn.schema";
import { addPixKeyData } from "../../repositories/admin/addPixKeyData.repository";

export const addPixKey = async(req: Request, res: Response): Promise<void> => {
    // Validar o corpo da requisição
    const body = addPixKeyInSchema.parse(req.body);

    // Adicionar a chave pix no banco de dados
    await addPixKeyData(body);

    // Responder a requisição com sucesso
    res.status(200).json({message: "Chave adicionada com sucesso"});
};

export default addPixKey;