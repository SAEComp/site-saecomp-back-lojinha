import express from "express";
import authenticate from "../../middlewares/authenticate";
import getProductPage from "../../controllers/client/getProductPage.controller";
import getProduct from "../../controllers/client/getProduct.controller";
import addToCart from "../../controllers/client/addToCart.controller";
import addComment from "../../controllers/client/addComment.controller";
import finishBuy from "../../controllers/client/finishBuy.controller";
import getPendingPayments from "../../controllers/client/getPendingPayments.controller";
import listenPayment from "../../controllers/client/listenPayment.controller";
import confirmPayment from "../../controllers/client/confirmPayment.controller";
import cancelPayment from "../../controllers/client/cancelPayment.controller";
import registerPayment from "../../controllers/client/registerPayment.controller";
import getCart from "../../controllers/client/getCart.controller";
import deleteCart from "../../controllers/client/deleteCart.controller";
import deleteItem from "../../controllers/client/deleteItem.controller";
import getPunctuation from "../../controllers/client/getPunctuation.controller";
import getPunctuationPage from "../../controllers/client/getPunctuationPage.controller";

// Instanciação do express
const userRouter = express.Router();

// Definição do tratamento de requisições
userRouter.get("/products", authenticate(['lojinha:product-home']), getProductPage);
userRouter.get("/product", authenticate(['lojinha:product-details']), getProduct);
userRouter.get("/cart", authenticate(['lojinha:cart']), getCart);
userRouter.post("/cart", authenticate(['lojinha:cart']), addToCart);
userRouter.delete("/cart", authenticate(['lojinha:cart']), deleteCart);
userRouter.delete("/item", authenticate(['lojinha:cart']), deleteItem);
userRouter.post("/comment", authenticate(['lojinha:add-comment']), addComment);
userRouter.post("/finish-order", authenticate(['lojinha:finish-order']), finishBuy);
userRouter.get("/pending-payment", authenticate(['lojinha:cart','lojinha:finish-order']), getPendingPayments);
userRouter.get("/listen-payment", authenticate(['lojinha:finish-order']), listenPayment);
userRouter.post("/confirm-payment", confirmPayment); // sem autenticação pois é endoint para mercado pago
userRouter.post("/cancel-payment", authenticate(['lojinha:finish-order']), cancelPayment);
userRouter.post("/register-payment", authenticate(['lojinha:finish-order']), registerPayment);
userRouter.get("/punctuation", authenticate(['lojinha:punctuation']), getPunctuation);
userRouter.get('/punctuations', authenticate(['lojinha:punctuation-log']), getPunctuationPage);


export default userRouter;