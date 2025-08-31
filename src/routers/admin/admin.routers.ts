import express from "express";
import getProductPage from "../../controllers/client/getProductPage.controller";
import getProduct from "../../controllers/client/getProduct.controller";

// Instanciação do express
const adminRounter = express.Router();

adminRounter.post('/admin/adicionarProduto');

// Definição do tratamento de requisições
export default adminRounter;