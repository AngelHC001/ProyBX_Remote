import dotenv from 'dotenv';
dotenv.config({path: '.env.development'});

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

//Middleware globales
app.use(cors({origin: 'https://proybx-remote.onrender.com', credentials: true}));
app.use(express.json());
app.use(cookieParser());

//Enrutamiento interno
app.use('/auth',authRoutes);
app.use('/drive',driveRoutes);
app.use(express.static(path.join(__dirname,'dist')))

app.get('*',(req,res) => {
    res.sendFile(path.join(__dirname,'dist','index.html'));
})


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));

export const uploadAuditoria = app;
