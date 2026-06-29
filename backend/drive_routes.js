import express from 'express';
import process from 'process';
import { google } from "googleapis";
import busboy from "busboy";

import { auth2Client } from './auth_config.js';
import { crearEstructuraReporte } from './drive_service.js';

const router = express.Router();

//Variables de entorno en produccion
const DRIVE_FOLDER = process.env.VITE_DRIVE_FOLDER;
const DRIVE_FILE = process.env.VITE_DRIVE_FILE;

//USA EL CLIENT ID
const drive = google.drive({ version: "v3", auth: auth2Client });

//FUNCION PARA EXTRAER EXCLUSIVE.JSON DEL DRIVE
let usuariosCache = null;
let ultimaCarga = 0;
const CACHE_TIME = 1000 * 60 * 5; //5 minutos de cache

export async function getUsersFromDrive(){
    // Si han pasado menos de 5 minutos, retorna la caché
    if(usuariosCache && (Date.now() - ultimaCarga < CACHE_TIME)){
        return usuariosCache;
    }

    //Si no, vuelve a consultar
    const response = await drive.files.get({
        fileId: DRIVE_FILE,
        alt: 'media'
    });

    //El json
    usuariosCache = response.data;
    ultimaCarga = Date.now();
    return usuariosCache;
}

/*
//MIDDLEWARE DE AUTENTICACION
const ensureAuth = async(req, res, next) => {
    const isValid = verifyCredentials();
    if(!isValid){
        return res.status(401).json({ error: "Fallo en la autenticación de Google" });
    }
    //lo que sigue dentro del post    
    next();
}
*/

router.get('/get_token', async(req,res) => {
    try {
        const tokenResponse = await auth2Client.getAccessToken();
        if (!tokenResponse.token) throw new Error("NO SE PUDO GENERAR UN TOKEN ACCESS VALIDO");
        console.log('AUTENTICADO');
        return res.status(200).json({access_token: tokenResponse.token});
    } catch (authError) {
        return res.status(500).json({message: "Error crítico de autenticación: " + authError});
    }
});


router.post('/upload', async(req,res) => {
    //CONFIGURACION DE CORS
    res.set('Access-Control-Allow-Methods', 'POST', 'OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){ return res.status(204).send(''); }

    //FILTROS DE OPERACION -- VALIDACION DE API TOKEN SECRETO
    const authHeader = req.headers.authorization;
    if(!authHeader | !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ error: 'ACCESO NO AUTORIZADO, TOKEN INVALIDO' });
    }

    //VALIDACION DE METODO
    if(req.method !== 'POST'){ return res.status(405).json({error: 'METODO NO PERMITIDO'}); }
    console.log('PASO FILTROS');
    
    try {        
        const bb = busboy({ headers: req.headers });
        const fields = {};

        //PROCESAMOS DATOS DEL FORMULARIO PURO TEXTO
        bb.on('field', (fieldname,val) => {
           fields[fieldname] = val; 
        });

        bb.on('finish', async() => {
            try {
                const metadata = JSON.parse(fields.metadata || '{}');
                const secciones = JSON.parse(fields.secciones || '{}');

                const folderId = await crearEstructuraReporte(drive, DRIVE_FOLDER, metadata, secciones);
                console.log('FOLDER Y TEXTO PLANO LISTOS');

                return res.status(200).json({status: 'success', message: 'Sincronizado con exito', folderDestiny: folderId });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error al procesar la subida a Drive: ' + error.message });
            }
        });

        req.pipe(bb);   
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;