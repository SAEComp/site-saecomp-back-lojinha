import cors from 'cors';

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5500",
    "http://saecomp.icmc.usp.br",
    "https://saecomp.icmc.usp.br",
];

const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
});

export default corsMiddleware;
