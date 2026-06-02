import { useState, useEffect } from "react";

export function ImagePreview({file, onRemove,onRetake}){
    const [previewURL, setPreviewURL] = useState(null);

    useEffect(() => {
        //Caso Placeholder - Eliminado
        if(!file){
            setPreviewURL(null);
            return;
        }
    
        //Tomo foto y se muestra la imagen
        const url = URL.createObjectURL(file);
        setPreviewURL(url);
        
        return () => {   
            URL.revokeObjectURL(url);
        }
    },[file]);


    //Si hay foto
    return(
       <div className="container">
            <img src={previewURL} alt="Fallo de auditoría" className="img-fluid rounded"/>

            {/* Superposición de controles al pasar el mouse/tap */}
            <div className="d-flex justify-content-center gap-2 p-2">
                {/* Escenario 3: Cambiar/Re-tomar foto */}
                <button onClick={onRetake} className="btn btn-secondary btn-sm">
                    <i className="bi bi-arrow-clockwise"/> Cambiar
                </button>
                
                {/* Escenario 4: Quitar foto -> vuelve a placeholder */}
                <button onClick={onRemove} className="btn btn-danger btn-sm">
                    <i className="bi bi-x"/> Cancelar
                </button>
            </div>
        </div>
    )
}