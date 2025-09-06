import express from "express";
import addProduct from "../../controllers/admin/addProduct.controller";
import editProduct from "../../controllers/admin/editProduct.controller";
import removeProduct from "../../controllers/admin/removeProduct.controller";
import getStatistics from "../../controllers/admin/getStatistics.controller";
import getBuyOrderPage from "../../controllers/admin/getBuyOrderPage.controller";
import getEntryHistoryPage from "../../controllers/admin/getEntryHistoryPage.controller";

// Instanciação do express
const adminRouter = express.Router();

adminRouter.post('/product', addProduct);
adminRouter.put('/product', editProduct);
adminRouter.delete('/product', removeProduct);
adminRouter.get('/statistics', getStatistics);
adminRouter.get('/orders-history', getBuyOrderPage);
adminRouter.get('/entries-history', getEntryHistoryPage);

// Definição do tratamento de requisições
export default adminRouter;