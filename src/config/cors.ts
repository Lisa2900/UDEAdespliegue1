import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whitelist = [process.env.FRONTEND_URL || 'https://udea-iota.vercel.app'];

        // Permitir peticiones sin origin (como las de Thunder Client o Postman)
        if (!origin || whitelist.includes(origin)) {
        callback(null, true);
        } else {
        callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
};
