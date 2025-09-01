import express from "express";
import getProductPage from "../../controllers/client/getProductPage.controller";
import getProduct from "../../controllers/client/getProduct.controller";
import addToCart from "../../controllers/client/addToCart.controller";
import addComment from "../../controllers/client/addComent.controller";

// Instanciação do express
const userRounter = express.Router();

// Definição do tratamento de requisições
userRounter.get("/", getProductPage);
userRounter.get("/detalhesProduto", getProduct);
userRounter.post("/adicionarCarrinho", addToCart);
userRounter.post("/adicionarComentario", addComment);

export default userRounter;