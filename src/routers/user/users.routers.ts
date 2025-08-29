import express from "express";
import getProductPage from "../../controllers/client/getProductPage.controller";
import getProduct from "../../controllers/client/getProduct.controller";

// Instanciação do express
const userRounter = express.Router();

// Definição do tratamento de requisições
userRounter.get("/", getProductPage);
userRounter.get("/detalhesProduto", getProduct);

export default userRounter;