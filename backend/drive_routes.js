import express from 'express';
import process from 'process';
import { google } from "googleapis";
import busboy from "busboy";
//import { PassThrough } from "stream";
//import { Buffer } from "buffer";

import {sanitizeText} from '../backend/utils.js';
///import { promises } from 'dns';

const router = express.Router();

//Variables de entorno en produccion
const DRIVE_FOLDER = process.env.VITE_DRIVE_FOLDER;
const DRIVE_FILE = process.env.VITE_DRIVE_FILE;

//oauth
const OAUTH_ID = process.env.VITE_OAUTH_ID;
const SECRET = process.env.VITE_SECRET_KEY;
const RFK = process.env.VITE_REFRESH_TOKEN;

const REDIRECT_URI = process.env.VITE_REDIRECT_URI;

//AUTENTICACION USANDO EL CLIENT ID
const auth2Client = new google.auth.OAuth2({
    clientId: OAUTH_ID,
    clientSecret:SECRET,
    redirectUri: REDIRECT_URI
});

/*
//HERRAMIENTA AUXILIAR PARA REFRESH TOKEN PERMANENTE, TAREA YA RESUELTA
router.get('/login-google',(req,res) => {
    const authUrl = auth2Client.generateAuthUrl({
        access_type:'offline',
        scope: ['https://www.googleapis.com/auth/drive.file']
    })
    res.redirect(authUrl);
});

//CALLBACK PUESTO EN CLOUD CONSOLE
router.get('/callback',async (req,res) => {
    const {code} = req.query;
    try {
        const { tokens } = await auth2Client.getToken(code);
        console.log('--- COPIA ESTE REFRESH TOKEN ---');
        console.log(tokens.refresh_token);
        console.log('--------------------------------');
        res.send('Token generado. Revisa los logs de Render.');
    } catch (err) {
        res.status(500).send('Error al obtener token: ' + err.message);
    }
});*/

auth2Client.setCredentials({ refresh_token: RFK });

//EVENTOS DE CAMBIO
auth2Client.on('tokens',(tokens) => {
    if(tokens.refresh_token){
        console.log('Nuevo token');
    }
    console.log('Acceso temporal renovado');
});

//USA EL CLIENT ID
const drive = google.drive({
    version: "v3", 
    auth: auth2Client
});


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

router.post('/upload', async(req,res) => {
    //CONFIGURACION DE CORS
    res.set('Access-Control-Allow-Methods', 'POST', 'OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    //VERIFICACION DE CREDENCIALES
    try {
        const tokenResponse = await auth2Client.getAccessToken();
        
        if(!tokenResponse.token){
            throw new Error("NO SE PUDO GENERAR UN TOKEN ACCESS VALIDO");
        }
        
        console.log("¡Autenticación OAUTH exitoso!");
    } catch (authError) {
        console.error("Error crítico de autenticación:", authError.message);
        return res.status(401).json({ error: `La cuenta no pudo autenticarse: ${authError.message}` });
    }

    //FILTROS DE OPERACION
    if(req.method === 'OPTIONS'){
        return res.status(204).send('');
    }

    //SECURITY CONSTRAINT 1 -- VALIDACION DE API TOKEN SECRETO
    const authHeader = req.headers.authorization;
    
    if(!authHeader | !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ error: 'ACCESO NO AUTORIZADO, TOKEN INVALIDO' });
    }

    if(req.method !== 'POST'){
        return res.status(405).json({error: 'METODO NO PERMITIDO'});
    }

    console.log('PASO FILTROS');

    try {
        //INICIALIZAR        
        const bb = busboy({ headers: req.headers });
        const fields = {};
        const filesToUpload = [];

        //2. PROCESAR TEXTO DEL FORMULARIO
        bb.on('field', (fieldname,val) => { fields[fieldname] = val; });             
        
        //3. SUBIR IMAGENES A SU CARPETA - STREAMING DIRECTO
        bb.on('file', (fieldname,file,info) => {
            filesToUpload.push({fieldname,file,info})
        }); 
        console.log('IMAGENES PROCESADAS EN COLA');
       
        bb.on('finish', async() => {
            try {
                //ZERO - EXTRAER DATOS ENVIADOS
                const metadata = JSON.parse(fields.metadata || '{}');
                const secciones = JSON.parse(fields.secciones || '{}');

                //1. CREAR CARPETA
                const hoy = new Date().toISOString().split('T')[0];
                const folderName = `${metadata.sucursal?.replace(/\s+/g, '_')}_${hoy}`;

                const folderResponse = await drive.files.create({
                    requestBody: { 
                        name: folderName,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [DRIVE_FOLDER]
                    },
                    fields: 'id'
                });
                    
                const folderId = folderResponse.data.id;
                console.log('FOLDER CREADO');

                let contenidoTxt = `REPORTE: ${metadata.sucursal}\nFECHA: ${metadata.fecha}\n\n`;
                Object.keys(secciones).forEach((seccion) => {
                    contenidoTxt += `\n[${seccion.toUpperCase()}]\n`;
                    secciones[seccion].forEach((p) => {
                        contenidoTxt += `Q${p.pregunta}: ${p.respuesta}\n`;
                        if (p.respuesta === 'NO') {
                            let obsLimpio = sanitizeText(p.observaciones)
                            contenidoTxt += `\t Observaciones: ${obsLimpio}\n`;
                        }
                    });
                });

                console.log('TEXTO PROCESADO');

                await drive.files.create({
                    requestBody: { name: 'reporte_datos.txt', parents: [folderId]},
                    media: { mimeType: 'text/plain', body: contenidoTxt }
                });
                console.log('TEXTO SUBIDO');

                const promisesToUpload = filesToUpload.map((f) => {
                    return drive.files.create({
                        requestBody: { name: f.info.filename, parents:[folderId] },
                        media: { mimeType: f.info.mimeType, body: f.file }
                    });
                });
              
                await Promise.all(promisesToUpload); //espera a que todas las fotos terminen
                console.log('IMAGENES SUBIDAS');
              
                return res.status(200).json({status: 'success', message: 'Sincronizado con exito'});
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