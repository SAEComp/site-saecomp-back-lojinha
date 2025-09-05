import express from "express";
import adminRounter from "./routers/admin/admin.routers";
import userRounter from "./routers/user/users.routers";
import authenticate from "./middlewares/authenticate";
import { errorHandler } from "./middlewares/errorHandler";

// Instanciação do express
const app = express();

// Número da porta usada
const port: number = 3000;

// ================= middlewares ================= //
app.use(express.json());
app.use(authenticate());

// ================= routers ================= //
app.use("/api/lojinha", userRounter);
app.use("/api/lojinha/admin", adminRounter);

// ================= error handler ================= //
app.use(errorHandler);

app.listen(port, () => {
    console.log(`serving on http://localhost:${port}`);
});