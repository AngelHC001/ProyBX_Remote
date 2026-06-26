import express from 'express';
import process from 'process';
import busboy from "busboy";

import {sanitizeText} from '../backend/utils.js';
const router = express.Router();

//const drive = useDrive;
//import { useDrive } from './drive_config.js';

const DRIVE_FOLDER = process.env.VITE_DRIVE_FOLDER;


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
        const fileQueue = { caja:[], alcn:[], sala:[], edif: [] };

        //2. PROCESAR TEXTO DEL FORMULARIO
        bb.on('field', (fieldname,val) => { fields[fieldname] = val; });             
        
        //3. SUBIR IMAGENES A SU CARPETA - STREAMING DIRECTO
        bb.on('file', (fieldname,file,info) => {
            const section = Object.keys(fileQueue).find(s => s.fieldname.startsWith(s));
            if(section){
                fileQueue[section].push({file,info});
            }

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

                for (const section in fileQueue) {
                    if(fileQueue[section].length > 0){
                        console.log('SUBIENDO ARCHIVOS SECCION '+ section);
                        await Promise.all(fileQueue[section].map(f => 
                            drive.files.create({
                                requestBody: { name: f.info.filename, parents:[folderId] },
                                media: { mimeType: f.info.mimeType, body: f.file }
                            })
                        ));
                    }
                }
                console.log('IMAGENES SUBIDAS');
                
                return res.status(200).json({status: 'success'});
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