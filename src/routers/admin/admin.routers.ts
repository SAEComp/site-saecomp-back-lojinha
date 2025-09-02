import express from "express";
import addProduct from "../../controllers/admin/addProduct.controller";
import editProduct from "../../controllers/admin/editProduct.controller";
import removeProduct from "../../controllers/admin/removeProduct.controller";
import getBuyOrderPage from "../../controllers/admin/getBuyOrderPage.controller";

// Instanciação do express
const adminRounter = express.Router();

adminRounter.post('/admin/adicionarProduto', addProduct);
adminRounter.post('/admin/editarProduto', editProduct);
adminRounter.delete('/admin/removerProduto', removeProduct)
adminRounter.get('/admin/obterPedidos', getBuyOrderPage);

// Definição do tratamento de requisições
export default adminRounter;