import { useState } from "react";
import { useFormStore } from "../store/useFormStore";

export function BotonDrive(){
    const { metadata, secciones } = useFormStore();
    const [isEnabled, SetIsEnabled] = useState(true);
    const [uploading, SetUploading] = useState(false);

    //configuracion local HACERLO ENV
    //const CLOUD_FUNCTION_URL = "https://REGION-PROYECTO.cloudfunctions.net/uploadAuditoria";
    const CLOUD_FUNCTION_URL = "http://localhost:8080/uploadAuditoria";
    const TOKEN = import.meta.env.VITE_TOKEN_KEY;

    const handleUpload = async() => {
        if(!metadata.sucursal || !metadata.fecha){
            alert("Por favor, registre la sucursal y la fecha antes de enviar.");
            return;
        }

        SetUploading(true);
        const formData = new FormData();
        
        //Adjuntar metadatos
        formData.append('metadata',JSON.stringify(metadata));
        formData.append('secciones', JSON.stringify(secciones));

        //Extraer y adjuntar imagenes al formData
        Object.keys(secciones).forEach((seccion) => {
            secciones[seccion].forEach((p) => {
                if(p.respuesta === 'NO' && p.fotos){
                    p.fotos.forEach((fotoFile,index) => {
                        if(fotoFile instanceof File){
                            const extension = fotoFile.name.split('.').pop() || 'png';
                            const nombreImagen = `${seccion}_q${p.pregunta}_falla${index + 1}.${extension}`;
                        
                            formData.append('images',fotoFile,nombreImagen);
                        }
                    });
                }
            });
        });

        //EJECUTAR PETICION
        try {
            const response = await fetch(CLOUD_FUNCTION_URL,{
                method: 'POST',
                body: formData,
                headers: {'Authorization' : `Bearer ${TOKEN}`}
            });

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.error || 'Error desconocido en el servidor');
            }

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