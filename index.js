import dotenv from 'dotenv';
dotenv.config({path: '.env.development'});

import express from 'express';
import cors from 'cors';

import authRoutes from './backend/auth_routes';
import driveRoutes from './backend/drive_routes';

const app = express();

//Middleware globales
app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.json());

//Enrutamiento interno
app.use('auth',authRoutes);
app.use('drive',driveRoutes);

export const uploadAuditoria = app;
