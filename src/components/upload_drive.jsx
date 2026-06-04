import { useState } from "react";
import { useFormStore } from "../store/useFormStore";
import { useGoogleLogin } from "@react-oauth/google";

export function BotonDrive(){
    const { metadata, secciones } = useFormStore();
    const [isEnabled, SetIsEnabled] = useState(true);
    const [uploading, SetUploading] = useState(false);

    //CONSULTAR API DRIVE
    const apiDrive = async (url,options,token) => {
        const response = await fetch(url,{...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            }
        });

        if(!response.ok){
            const errorJson = await response.json();
            throw new Error(errorJson.error?.message || 'Error en la API de Drive');
        }
        return response.json();
    }

     //CREAR LA CARPETA EN DRIVE
    const crearCarpeta = async(token) => {
        //Carpeta con el nombre del dia
        const hoy = new Date().toISOString().split('T')[0];
        const nombreCarpeta = `${metadata.sucursal.replace(/\s+/g, '_')}_${hoy}`;

        const metadataCarpeta = {
            name: nombreCarpeta,
            mimeType: 'application/vnd.google-apps.folder'
        };

        const data = await apiDrive('https://www.googleapis.com/drive/v3/files',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadataCarpeta),
        },token);

        return data.id;
    };

     //ENVIAR ARCHIVO A DRIVE
    const subirArchivoDrive = async(blob, nombreArchivo, mimeType, folderId, token) => {
        const form = new FormData();

        //Metadata del archivo
        const fileMetadata = { name: nombreArchivo, parents: [folderId] };
        const metadataBlob =  new Blob([JSON.stringify(fileMetadata)], 
                                        {type: 'application/json; charset=UTF-8'});

        form.append('metadata', metadataBlob);
        form.append('file', blob);
   
        await apiDrive('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            body: form,
        }, token);
    };

     //FLUJO PRINCIPAL OAUTH
    const login2Upload = useGoogleLogin({
        flow: 'implicit',
        scope: 'https://www.googleapis.com/auth/drive.file',
        onSuccess: async(tokenResponse) => {
            const accessToken = tokenResponse.access_token;
            SetUploading(true);

            try {
                //Crear Carpeta
                const folderId = await crearCarpeta(accessToken);
              
                //COMPILAR Y SUBIR EL ARCHIVO DE TEXTO
                let contenidoTxt = `REPORTE SUCURSAL: ${metadata.sucursal} CON FECHA ${metadata.fecha}\n`;
                
                Object.keys(secciones).forEach((seccion) => {
                    contenidoTxt += `[${seccion.toUpperCase()}]\n`;

                    secciones[seccion].forEach((p) => {
                        contenidoTxt += `  Pregunta ${p.pregunta}: ${p.respuesta || 'N/A'}\n`;
                        if(p.respuesta === 'NO'){ 
                            contenidoTxt += `       -Obs: ${p.observaciones || 'Sin observaciones'}\n`;
                        } 
                    });
                });

                const blobTxt = new Blob([contenidoTxt], {type: 'text/plain'});
                await subirArchivoDrive(blobTxt, `${metadata.sucursal}_Respuestas.txt`,
                    'text-plain',folderId,accessToken);

                console.log('TXT SUBIDO CON EXITO');
                
                //PROCESAR E IDENTIFICAR IMAGENES
                for (const seccion of Object.keys(secciones)) {
                    for (const p of secciones[seccion]) {
                       if(p.respuesta === 'NO' && p.fotos){
                            for (let i = 0; i < p.fotos.length; i++) {
                                const fotoFile = p.fotos[i];
                                if(fotoFile instanceof File){
                                    const extension = fotoFile.name.split('.').pop() || 'png';
                                    const nombreImagen = `${seccion}_q${p.pregunta}_falla${i + 1}.${extension}`;
                                    await subirArchivoDrive(fotoFile, nombreImagen, fotoFile.type, folderId, accessToken);
                                    console.log('IMAGEN SUBIDA'+ i);
                                }
                            }//for
                        } //if
                    }//for
                }//for

                alert('¡Sincronizada exitosamente en Google Drive!');
            } catch (error) {
                console.error(error);
                alert(`Error al sincronizar: ${error.message}`);
            }
            finally{
                SetUploading(false);
            }
            
        },
        onError: (error) => {
            alert('Error en la autenticación con Google');
            console.error(error);
        }
    });

    const handleUpload = () => {
        if(!metadata.sucursal || !metadata.fecha){
            alert("Por favor, registre la sucursal y la fecha antes de enviar.");
            return;
        }

        login2Upload();
    }
    
    
    return(
        <div className="text-center alert alert-danger rounded p-3">
            <div className="form-check-inline">
                <input className="form-check-input me-2" type="checkbox" onClick={() => SetIsEnabled(!isEnabled)}/>
                <label className="form-check-label">Todo listo para enviar</label>
            </div>  

            <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={isEnabled || uploading}>
                {uploading ? '🔄 Sincronizando con Drive...' : '🚀 Autenticar y Guardar en Drive'}
            </button>      
        </div>
    )

}