import express from "express";
import addPixKey from "../../controllers/admin/addPixKey.controller";
import getPixKey from "../../controllers/admin/getPixKey.controller";
import removePixKey from "../../controllers/admin/removePixKey.controller";
import addProduct from "../../controllers/admin/addProduct.controller";
import editProduct from "../../controllers/admin/editProduct.controller";
import removeProduct from "../../controllers/admin/removeProduct.controller";
import getStatistics from "../../controllers/admin/getStatistics.controller";
import getBuyOrderPage from "../../controllers/admin/getBuyOrderPage.controller";
import getEntryHistoryPage from "../../controllers/admin/getEntryHistoryPage.controller";
import {addProductImage, upload} from "../../controllers/admin/addProductImage.controller";

// Instanciação do express
const adminRouter = express.Router();

// Definição das rotas de administração
adminRouter.post('/pix-key', addPixKey);
adminRouter.get('/pix-key', getPixKey);
adminRouter.delete('/pix-key', removePixKey);
adminRouter.post('/product', addProduct);
adminRouter.put('/product', editProduct);
adminRouter.delete('/product', removeProduct);
adminRouter.get('/statistics', getStatistics);
adminRouter.get('/orders-history', getBuyOrderPage);
adminRouter.get('/entries-history', getEntryHistoryPage);
adminRouter.post('/files/product', upload.single('productImage'), addProductImage);

// Definição do tratamento de requisições
export default adminRouter;