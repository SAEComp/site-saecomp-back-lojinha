import express from "express";
import addProduct from "../../controllers/admin/addProduct.controller";
import editProduct from "../../controllers/admin/editProduct.controller";
import removeProduct from "../../controllers/admin/removeProduct.controller";
import getBuyOrderPage from "../../controllers/admin/getBuyOrderPage.controller";
import getEntryHistoryPage from "../../controllers/admin/getEntryHistoryPage.controller";

// Instanciação do express
const adminRouter = express.Router();

adminRouter.post('/produto', addProduct);
adminRouter.put('/produto', editProduct);
adminRouter.delete('/produto', removeProduct);
adminRouter.get('/historico-pedidos', getBuyOrderPage);
adminRouter.get('/historico-entradas', getEntryHistoryPage);

// Definição do tratamento de requisições
export default adminRouter;