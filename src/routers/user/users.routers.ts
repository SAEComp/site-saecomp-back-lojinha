import express from "express";
import getProductPage from "../../controllers/client/getProductPage.controller";
import getProduct from "../../controllers/client/getProduct.controller";
import addToCart from "../../controllers/client/addToCart.controller";
import addComment from "../../controllers/client/addComment.controller";
import finishBuy from "../../controllers/client/finishBuy.controller";
import registerPayment from "../../controllers/client/registerPayment.controller";
import getCart from "../../controllers/client/getCart.controller";

// Instanciação do express
const userRouter = express.Router();

// Definição do tratamento de requisições
userRouter.get("/produtos", getProductPage);
userRouter.get("/produto", getProduct);
userRouter.get("/carrinho", getCart);
userRouter.post("/carrinho", addToCart);
userRouter.post("/comentario", addComment);
userRouter.post("/finalizar-pedido", finishBuy);
userRouter.post("/pagar-pedido", registerPayment);

export default userRouter;