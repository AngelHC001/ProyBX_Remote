import { useState } from "react";
import { useFormStore } from "../store/useFormStore";
//import imageCompression from "browser-image-compression";

const API_URL = import.meta.env.VITE_API_URL;
const HOMEMADE_TOKEN = import.meta.env.VITE_HOMEMADE_TOKEN;


export function BotonDrive(){
    const { metadata, secciones } = useFormStore();
    const [isEnabled, SetIsEnabled] = useState(true);
    const [uploading, SetUploading] = useState(false);

    //const GET_TOKEN = `${API_URL}/drive/get_token`;
    const PHASE_ONE_URL = `${API_URL}/drive/upload`;
   
    const handleUpload = async() => {
        if(!metadata.sucursal || !metadata.fecha){
            alert("Por favor, registre la sucursal y la fecha antes de enviar.");
            return;
        }
        SetUploading(true);        
        
       
        //Adjuntar metadatos
        /*
        const imagePromises = [];

        //Extraer y adjuntar imagenes al formData
        Object.keys(secciones).forEach((seccion) => {
            secciones[seccion].forEach((p) => {
                if(p.respuesta === 'NO' && p.fotos){
                    p.fotos.forEach((fotoFile,index) => {
                        
                        if(fotoFile instanceof File){
                            imagePromises.push((async()=>{
                                try {
                                    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, };
                                    const compressedFile = await imageCompression(fotoFile,options);

                                    const extension = fotoFile.name.split('.').pop() || 'png';
                                    const nombreImagen = `${seccion}_q${p.pregunta}_falla${index + 1}.${extension}`;
                                    formData.append('images',compressedFile, nombreImagen);
                                } catch (error) {
                                    console.error("Error al comprimir:", error);
                                    formData.append('images', fotoFile, fotoFile.name);
                                }
                            })());
                        }//if
                    });//fotos
                }
            });//forEach
        });//forEach

        //esperar que todas las imagenes se compriman
        //await Promise.all(imagePromises)
        console.log('IMAGENES PROCESADAS');*/
        

        //EJECUTAR PETICION
        try {
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
            const folderDestiny = result.folderDestiny;
            if(!responseOne.ok) throw new Error(result.error || 'Error desconocido en el servidor');
            
            console.log(folderDestiny);
            alert('Reporte enviado al drive central!');
            
        } catch (error) {
            console.error(error);
            alert(`Ocurrio un error ${error}`);
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
        </div>
    )
}