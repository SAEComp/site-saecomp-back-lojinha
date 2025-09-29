import { Request, Response} from "express";
import { ApiError } from "../../errors/ApiError";
import { addProductImageInSchema } from "../../schemas/lojinha/input/addProductImageIn.schema";
import multer from "multer" 
import fs from "fs";
import dotenv from "dotenv"

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Cria o diretório de upload se não existir
const uploadDir = process.env.UPLOAD_IMAGES_DIR || 'upload';
if (!fs.existsSync(uploadDir)){ 
    fs.mkdirSync(uploadDir, {recursive: true}); // Cria diretórios pai, se necessário
}


// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    // Define o destino do arquivo
    destination: function(req, file, cb){
        cb(null, uploadDir);
    },
    
    // Define o nome do arquivo
    filename(req, file, cb) {
        // Obtém a extensão do arquivo
        const imageExtension = file.originalname.split('.').pop();
        const productImageName = req.body.productId;
        cb(null, `${productImageName}.${imageExtension}`);   
    },
});

// Validação antes do upload de arquivos 
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    
    // Valida o corpo da requisição
    const body = addProductImageInSchema.parse(req.body);
    
    // Verifica se o productId foi fornecido
    if(!body.productId){
        return cb(new ApiError(400, "Id do produto é obrigatório"));
    }

    // Verifica se o arquivo enviado é uma imagem
    const imageExtension = file.originalname.split('.').pop();
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const allowedMimeTypes = ['image/png', 'image/jpeg'];
    if (
        !imageExtension ||
        !allowedExtensions.includes(imageExtension.toLowerCase()) ||
        !allowedMimeTypes.includes(file.mimetype)
    ) {
        return cb(new ApiError(400, "Apenas arquivos de imagem são permitidos (png, jpg, jpeg)"));
    }
    
    // Aceita o arquivo
    cb(null, true);
};

// Instancia o multer com as configurações definidas
export const upload = multer({ storage: storage, fileFilter});

// Controlador para adicionar imagem e enviar resposta
export const addProductImage = async(req: Request, res: Response): Promise<void> =>{
    // Verifica se o arquivo foi enviado
    if(!req.file) throw new ApiError(404, 'Nenhuma imagem enviada');

    // Retorna sucesso
    res.status(200).json({message: 'Imagem adicionada com sucesso'});
};

