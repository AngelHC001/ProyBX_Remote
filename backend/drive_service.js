import { sanitizeText } from "./utils.js";

export async function crearEstructuraReporte(drive, parentFolder, metadata, secciones){
    //1. Crear carpeta
    const hoy = new Date().toISOString().split('T')[0];
    const folderName = `${metadata.sucursal?.replace(/\s+/g, '_')}_${hoy}`;
                    
    const folderResponse = await drive.files.create({
        requestBody: { 
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolder]
        },
        fields: 'id'
    });

    const folderId = folderResponse.data.id;
    console.log('FOLDER CREADO');
    
    //Crear archivo txt
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

    //subir archivo txt
    await drive.files.create({
        requestBody: { name: 'reporte_datos.txt', parents: [folderId] },
        media: { mimeType: 'text/plain', body: contenidoTxt }
    });

    console.log('TEXTO PLANO LISTO');
    return folderId;                
}