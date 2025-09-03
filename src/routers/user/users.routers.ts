import express from "express";
import getProductPage from "../../controllers/client/getProductPage.controller";
import getProduct from "../../controllers/client/getProduct.controller";
import addToCart from "../../controllers/client/addToCart.controller";
import addComment from "../../controllers/client/addComent.controller";
import finishBuy from "../../controllers/client/finishBuy.controller";
import registerPayment from "../../controllers/client/registerPayment.controller";
import getCart from "../../controllers/client/getCart.controller";

// Instanciação do express
const userRounter = express.Router();

// Definição do tratamento de requisições
userRounter.get("/produtos", getProductPage);
userRounter.get("/produto", getProduct);
userRounter.get("/carrinho", getCart);
userRounter.post("/carrinho", addToCart);
userRounter.post("/comentario", addComment);
userRounter.post("/finalizar-pedido", finishBuy);
userRounter.post("/pagar-pedido", registerPayment);

export default userRounter;