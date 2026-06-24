import express from 'express';
import process from 'process';
import { google } from "googleapis";
import busboy from "busboy";
import { PassThrough } from "stream";
import { Buffer } from "buffer";


import {sanitizeText} from '../backend/utils.js';

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
    redirectUri:"https://developers.google.com/oauthplayground"
});

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
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
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
        const bb = busboy({ headers: req.headers });
        const fields = {};
        const filesToUpload = [];

        //PROCESAMOS DATOS DEL FORMULARIO
        bb.on('field', (fieldname,val) => {
           fields[fieldname] = val; 
        });

        //PROCESAR IMAGENES
        bb.on('file', (fieldname,file,info) => {
            const { filename, mimeType } = info;
            const buffers = [];

            file.on('data', (data) => buffers.push(data));
            file.on('end', () => {
                filesToUpload.push({
                    name: filename,
                    mimeType: mimeType,
                    content: Buffer.concat(buffers)
                })
            });
        }); 

        console.log('PASO EL PROCESS');
        bb.on('finish', async() => {
            try {
                const metadata = JSON.parse(fields.metadata || '{}');
                const secciones = JSON.parse(fields.secciones || '{}');

                //Crear carpeta
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
                
                //Crear y subir archivo de texto plano (.txt)
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

                await drive.files.create({
                    requestBody: { 
                        name: 'reporte_datos.txt', 
                        parents: [folderId]
                    },
                    media: { 
                        mimeType: 'text/plain', 
                        body: contenidoTxt 
                    }
                });

                console.log('TEXTO PLANO LISTO');
                

                //Subir las imágenes asociadas vinculándolas a la carpeta
                for(const fileObj of filesToUpload){
                    const bufferStream = new PassThrough();
                    bufferStream.end(fileObj.content);
                    
                    await drive.files.create({
                        requestBody: {
                            name: fileObj.name, 
                            parents:[folderId]
                        },
                        media: {
                            mimeType: fileObj.mimeType, 
                            body: bufferStream
                        }
                    });
                }

                console.log('IMAGENES LISTAS');
                return res.status(200).json({status: 'success', message: 'Sincronizado con exito'});
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error al procesar la subida a Drive: ' + error.message });
            }
        });

        bb.end(req.rawBody);    
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;