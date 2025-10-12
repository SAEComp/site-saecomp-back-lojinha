import dotenv from "dotenv"
// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

import express from "express";
import { openApiDoc } from "./docs/config";
import adminRounter from "./routers/admin/admin.routers";
import userRounter from "./routers/user/users.routers";
import authenticate from "./middlewares/authenticate";
import { errorHandler } from "./middlewares/errorHandler";
import swaggerUi from 'swagger-ui-express';


// Instanciação do express
const app = express();

// Número da porta usada
const port: number = 3000;

// ================= middlewares ================= //
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// ================= routers ================= //
app.use("/api/lojinha", userRounter);
app.use("/api/lojinha/admin", adminRounter);

app.use('/api/lojinha/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

// ================= error handler ================= //
app.use(errorHandler);

app.listen(port, () => {
    console.log(`serving on http://localhost:${port}`);
});