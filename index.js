import dotenv from 'dotenv';
dotenv.config({path: '.env.development'});

import express from 'express';
import process from 'process';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './backend/auth_routes.js';
import driveRoutes from './backend/drive_routes.js';

const app = express();

//Middleware globales
app.use(cors({origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true}));
app.use(express.json());
app.use(cookieParser());

//Enrutamiento interno
app.use('/auth',authRoutes);
app.use('/drive',driveRoutes);

//const port = process.env.PORT || 8080;
//app.listen(port, () => console.log(`Servidor en puerto ${port}`));

export const uploadAuditoria = app;
