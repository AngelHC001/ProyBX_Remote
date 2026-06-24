//ESPACIO DE PRUEBAS
//import dotenv from 'dotenv';
//dotenv.config({path: '.env.development'});

import express from 'express';
import process from 'process';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes from './backend/auth_routes.js';
import driveRoutes from './backend/drive_routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const corsOptions = { origin: process.env.NODE_ENV === 'production' ?
    'https://proybx-remote.onrender.com' : 'http://localhost:5173'
    , credentials: true }

//Middleware globales
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//Enrutamiento interno
app.use('/api/auth',authRoutes);
app.use('/api/drive',driveRoutes);
app.use(express.static(path.join(__dirname,'dist')))


app.get(/^(?!\/api).*/,(req,res) => {
    res.sendFile(path.join(__dirname,'dist','index.html'));
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//export const uploadAuditoria = app;
