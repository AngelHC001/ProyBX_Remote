import { useState } from "react";
import { useFormStore } from "../store/useFormStore";
import imageCompression from "browser-image-compression";

const API_URL = import.meta.env.VITE_API_URL;
const HOMEMADE_TOKEN = import.meta.env.VITE_HOMEMADE_TOKEN;


async function PreparePromises(imgFile, folderID, secData, access_token){
    const fileData = new FormData();
    const fileMetadata = { name: imgFile.name, parents: [folderID]}
    
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, };
    
    const extension = imgFile.name.split('.').pop() || 'png';
    const nombreImagen = `${secData[0]}_q${secData[1]}_falla${secData[2]}.${extension}`;
        
    try {
        //Comprimir   
        const compressedFile = await imageCompression(imgFile,options);
       
        //Preparar promesa
        fileData.append('metadata', new Blob([JSON.stringify(fileMetadata)], {'type': 'application/json'} ));
        fileData.append('image',compressedFile, nombreImagen);

        return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{
            method: 'POST',
            headers: {'Authorization': `Bearer ${access_token}`},
            body: fileData
        });

    } catch (error) {
        console.error("Error al comprimir:", error);
        fileData.append('images', imgFile, nombreImagen);
    }
}


export function BotonDrive(){
    const { metadata, secciones } = useFormStore();
    const [isEnabled, SetIsEnabled] = useState(true);
    const [uploading, SetUploading] = useState(false);
    const [progress, SetProgress] = useState({percent: 0 , text: 'Listo para Enviar'});

    const GET_TOKEN = `${API_URL}/drive/get_token`;
    const PHASE_ONE_URL = `${API_URL}/drive/upload`;
   
    const handleUpload = async() => {
        if(!metadata.sucursal || !metadata.fecha){
            alert("Por favor, registre la sucursal y la fecha antes de enviar.");
            return;
        }
        SetUploading(true);        
        SetProgress({ percent: 10, text: 'Recopilando Datos' });
        //EJECUTAR PETICION
        try {
            //Adjuntar metadatos
            const formData = new FormData();
            formData.append('metadata',JSON.stringify(metadata));
            formData.append('secciones', JSON.stringify(secciones));
            
            //FASE 1 - RECLAMA TOKEN, CREA FOLDER Y TXT
            const responseOne = await fetch(PHASE_ONE_URL,{
                method: 'POST',
                body: formData,
                headers: {'Authorization' : `Bearer ${HOMEMADE_TOKEN}`}
            });

            const result = await responseOne.json();
            if(!responseOne.ok) throw new Error(result.error || 'Error desconocido en el servidor');
            
            SetProgress({ percent: 30, text: 'Reporte Enviado, preparando imágenes...' });
            const folderDestiny = result.folderDestiny;

            //FOLDER Y TXT CARGADOS
            //FASE 2 - CARGA DE IMAGENES DIRECTO A LA API DE DRIVE
            const imagePromises = [];
            const tokenResponse = await fetch(GET_TOKEN);
            const { access_token } = await tokenResponse.json();
            
            //Extraer y adjuntar imagenes al formData
            Object.keys(secciones).forEach((seccion) => {
                secciones[seccion].forEach((p) => {
                    if(p.respuesta === 'NO' && p.fotos){
                        p.fotos.forEach((fotoFile, index) => {
                            if(fotoFile instanceof File){

                                imagePromises.push((async()=>{
                                    await PreparePromises(fotoFile, folderDestiny, 
                                        [seccion, p.pregunta, index + 1], access_token)
                                })());
                            
                            }//if
                        });//fotos
                    }
                });//forEach
            });//forEach

            const totalFotos = imagePromises.length;
            let fotosSubidas = 0;

            //Atencion en esta operacion
            const uploadTasks = imagePromises.map(async (task) => {
                await task;
                fotosSubidas++;
                const currentPercent = 30 + Math.floor((fotosSubidas / totalFotos) * 70);
                SetProgress({ 
                    percent: currentPercent, 
                    text: `Subiendo foto ${fotosSubidas} de ${totalFotos}...` 
                });
            });

            await Promise.all(uploadTasks); //imagePromises
            SetProgress({ percent: 100, text: '¡Reporte enviado exitosamente!' });
        } catch (error) {
            console.error(error);
            SetProgress({ percent: 30, text: 'Ocurrio un Error en el envío' });
        }finally{
            SetUploading(false);
        }
    }

    return(
        <div className="text-center alert alert-danger rounded">
            <div className="form-check-inline">
                <input className="form-check-input me-2" type="checkbox" onClick={() => SetIsEnabled(!isEnabled)}/>
                <label className="form-check-label">Todo listo para enviar</label>
            </div>  


            <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={isEnabled || uploading}>
                {uploading ? '🔄 Sincronizando con Drive...' : '🚀 Autenticar y Guardar en Drive'}
            </button>

            {uploading && (
                <div className="mt-3">
                    <div className="progress" style={{ height: '20px' }}>
                        <div  className="progress-bar progress-bar-striped progress-bar-animated" 
                        role="progressbar"  style={{ width: `${progress.percent}%` }}>
                            {progress.percent}%
                        </div>
                    </div>
                    <small className="text-muted">{progress.text}</small>
                </div>
            )}      
        </div>
    )
}

 /*try {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, };
    const compressedFile = await imageCompression(imgFile,options);

    const extension = fotoFile.name.split('.').pop() || 'png';
    const nombreImagen = `${seccion}_q${p.pregunta}_falla${index + 1}.${extension}`;
    formData.append('images',compressedFile, nombreImagen);
} catch (error) {
    console.error("Error al comprimir:", error);
    formData.append('images', fotoFile, fotoFile.name);
}*/