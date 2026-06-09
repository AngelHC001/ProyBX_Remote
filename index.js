import { google } from "googleapis";
import busboy from "busboy";
import { PassThrough } from "stream";
import { Buffer } from "buffer";

//sera variable de entorno en produccion
const ENV_VALUES_TEST = {
    API_TOKEN: "UN_TOKEN_MUY_LARGO_Y_SECRETO_GENERADO_POR_TI_123456",
    CARPETA_RAIZ_DRIVE: "189AnRt0Id2Cl5V8neunxnkllMadr8Dr4"
}

//LA CUENTA DE SERVICIO
const credentials = {
  type: "service_account",
  project_id: "bxremote-intime",
  private_key_id: "1e882e726eab7910ec2fcbc2bd7525dd055cde3e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZlEhTy4S3cUD0\nd83GhJIw0Hy9T4ooJXbdBKHgDJ9w35JmiclkLwy9b7z1ZoqMcAU3cw02yvju+JE/\nW9KI6kUIQ6py46cXoN679sNxv/1mON9cWzZ64dixbWgy0LFOdbaLYpgKXBRb86Nx\n/DsNNthgyEuQBnXiucW6ayj0379CiNmFZLmK3LePdr8VqR0bvSY6UvT7gwmCL8Lx\nuT83J+nBb/HS4ZmnsfTs/k/TrsKAOFQ7TMz4iIyYym6g4vhlrRmQtIh4ZnlTUCsi\nzKiMwu7BItbF49zqD3AHI8AXUct04ITEgxC4ueaf+57UVSUYYyGVTQG27JryjGy7\n0dPLrXoHAgMBAAECggEAYUJrCGYX1+Z82ir5pY1aSg7QS9GT2PlSRl8NOzl5Rjvy\nVfqutyVfBQk/RtVFBp0Gf/BijkUx/KTJTLCvjntmS1jwBvZjmWjUV+JpIF5pl/nB\nQqgVVN3C/yEAbIKkV4XACVOT0kGx6h6hR9Ev1mrXU4AFYwa4SJaxX/EJ+FhSRxtR\nM51o+qQICMFAj14HGfPHKuWb+H8eTnW070WagmGlLA2iJwqvN2v+iSxWTsDcrgK6\n6HRFQw91jSSHb9SoZSdMNkUrEsiMQ5f0QEQVA+FLIN0UYarV1HvrDTEGtRQ3sv3s\noFluPSkodzVvkxyUM0KXiuz+mItJw6BXEGqZdVVZVQKBgQD1czVMT3rarftHD84z\nNVkXrO1QdUj7nmn5UdAea6Gawri7azgtFbboa3532JjrlO/wpAuAjuNfqU0NCrP8\nuURR1XgvNc+9AJmvTIFkxEpeHc3PUpVxl60CutLTd/lrF9t5AHpYHRoU29UDNdP2\nKWF0vb3C9I1dE6IuUcnBXD24LQKBgQDi7mZjDjQz0E3fa69Cs4MA24WFpDHgb345\nZki0FnF1O61tjEg3+fRSDw9/K5HTshb8g4R7nqj3kpyIjZRg+gg3Um5aG7FHTvLw\nNw/NB+6TF5i97208WFDXHvQijStx3EctoA6Wmd+ElY2q9HODdoRXB4VODAjbxcpx\nTQSkqqsHgwKBgA2fECUlAAdkwl4mNWZIHqKeuSjO6Xb1SqJIdQlLJdPF3KSiBaMS\n4myxknoqLgpc4Jf1MqI2y82CQsFnh6eNzInSE/JixR2TC/RbhY7HCe2BL+vChIKi\nTTqqjYqozNGxqD9l1GRRcSIZNRARi6rMjxkAcqiAE9xHe6egaFbvvIkdAoGBAImV\nrLHlzLSVWIFa0nmISKbecUejUzIVptu6Ld4xtTw0oGNIqAh4HS8bPnQFwHYvBUy3\nmD0y5pKjaxBHdmyNaynPamRrYcIwFY6ac5QFeRnpNowBe6MYkHq8o5vHJ03zFZyN\n7ApW5HOIEMpTRy2vT3FMd//nv/8vHhwva99CMkttAoGBAK1CIRaqQfrO5azQa9oW\nC2t/gesqJt9NsAtNkWGo5ZZyF3jSFQEdcyxtJcMAR/AfPdF1DIQZbkN0ISVX/vyL\nmRCfdkIcDoVFY7eG4CBhu7gMLX5rY6Joydua4OZi92P6kKhnCnWl0SPI2lKa9jYY\nCaXPz/M2dfMZC7FM8fHFn0iq\n-----END PRIVATE KEY-----\n",
  client_email: "bxremote-intime-bot@bxremote-intime.iam.gserviceaccount.com",
  client_id: "116075726182714957545",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/bxremote-intime-bot%40bxremote-intime.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const llaveLimpia = credentials.private_key.replace(/\\n/g, '\n');

//AUTENTICACION USANDO EL BOT
const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: llaveLimpia,
    scopes: ['https://www.googleapis.com/auth/drive']
});

//USA LA CUENTA DE SERVICIO
const drive = google.drive({
    version: "v3", 
    auth: auth
});


export const uploadAuditoria = async(req,res) => {
    //CONFIGURACION DE CORS
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173'); //COMPROBAR ORIGENES LIGA DE PRODUCCION
    res.set('Access-Control-Allow-Methods', 'POST', 'OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // FORZAR COMPROBACIÓN DE CREDENCIALES
    try {
        await auth.authorize();
        console.log("¡Autenticación con Cuenta de Servicio exitosa!");
    } catch (authError) {
        console.error("Error crítico de autenticación JWT:", authError.message);
        return res.status(401).json({ error: `La Cuenta de Servicio no pudo autenticarse: ${authError.message}` });
    }


    if(req.method === 'OPTIONS'){
        return res.status(204).send('');
    }

    //SECURITY CONSTRAINT 1 -- VALIDACION DE API TOKEN SECRETO
    const authHeader = req.headers.authorization;

    if(!authHeader || authHeader !== `Bearer ${ENV_VALUES_TEST.API_TOKEN}`){
        return res.status(401).json({ error: 'ACCESO NO AUTORIZADO, TOKEN INVALIDO' });
    }

    if(req.method !== 'POST'){
        return res.status(405).json({error: 'METODO NO PERMITIDO'});
    }

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

        bb.on('finish', async() => {
            try {
                const metadata = JSON.parse(fields.metadata || '{}');
                const secciones = JSON.parse(fields.secciones || '{}');

                //crear carpeta
                const hoy = new Date().toISOString().split('T')[0];
                const folderName = `${metadata.sucursal?.replace(/\s+/g, '_')}_${hoy}`;
                
                const folderResponse = await drive.files.create({
                    requestBody: { 
                        name: folderName,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [ENV_VALUES_TEST.CARPETA_RAIZ_DRIVE]
                    },
                    fields: 'id'
                });
            
                const folderId = folderResponse.data.id;

                //Crear y subir archivo de texto plano (.txt)
                let contenidoTxt = `REPORTE: ${metadata.sucursal}\nFECHA: ${metadata.fecha}\n\n`;
                Object.keys(secciones).forEach((seccion) => {
                    contenidoTxt += `\n[${seccion.toUpperCase()}]\n`;
                    secciones[seccion].forEach((p) => {
                        contenidoTxt += `Q${p.pregunta}: ${p.respuesta}\n`;
                        if (p.respuesta === 'NO') contenidoTxt += `\t \t Obs: ${p.observaciones}\n`;
                    });
                });

                await drive.files.create({
                    supportsAllDrives: true,
                    requestBody: { 
                        name: 'reporte_datos.txt', 
                        parents: [folderId]
                    },
                    media: { 
                        mimeType: 'text/plain', 
                        body: contenidoTxt 
                    }
                });

                //Subir las imágenes asociadas vinculándolas a la carpeta
                for(const fileObj of filesToUpload){
                    const bufferStream = new PassThrough();
                    bufferStream.end(fileObj.content);
                    
                    await drive.files.create({
                        supportsAllDrives: true,
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
}
