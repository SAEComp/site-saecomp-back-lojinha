import express from "express";
import addProduct from "../../controllers/admin/addProduct.controller";
import editProduct from "../../controllers/admin/editProduct.controller";
import removeProduct from "../../controllers/admin/removeProduct.controller";
import getBuyOrderPage from "../../controllers/admin/getBuyOrderPage.controller";

// Instanciação do express
const adminRounter = express.Router();

adminRounter.post('/produto', addProduct);
adminRounter.put('/produto', editProduct);
adminRounter.delete('/produto', removeProduct)
adminRounter.get('/historico-pedidos', getBuyOrderPage);

// Definição do tratamento de requisições
export default adminRounter;