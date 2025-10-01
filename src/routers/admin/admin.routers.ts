import express from "express";
import authenticate from "../../middlewares/authenticate";
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
adminRouter.post('/pix-key', authenticate(['lojinha:pix-key-management']), addPixKey);
adminRouter.get('/pix-key', authenticate(['lojinha:pix-key-management']), getPixKey);
adminRouter.delete('/pix-key', authenticate(['lojinha:pix-management']), removePixKey);
adminRouter.post('/product', authenticate(['lojinha:product-management']), addProduct);
adminRouter.put('/product', authenticate(['lojinha:product-management']), editProduct);
adminRouter.delete('/product', authenticate(['lojinha:product-management']), removeProduct);
adminRouter.get('/statistics', authenticate(['lojinha:stats']), getStatistics);
adminRouter.get('/orders-history', authenticate(['lojinha:orders-log']), getBuyOrderPage);
adminRouter.get('/entries-history', authenticate(['lojinha:entries-log']),getEntryHistoryPage);
adminRouter.post('/files/product', authenticate(['lojinha:product-management']), upload.single('productImage'), addProductImage);

// Definição do tratamento de requisições
export default adminRouter;