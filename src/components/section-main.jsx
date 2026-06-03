import { useState } from "react";
import { useFormStore } from "../store/useFormStore";

const sucursales = [
    { key: 'sc_0', name: 'Elegir' },
    { key: 'sc_1', name: 'Cancun Av Tulum' },
    { key: 'sc_2', name: 'Tankah' },
    { key: 'sc_3', name: 'Talleres' },
    { key: 'sc_4', name: 'Isla Mujeres' },
    { key: 'sc_5', name: 'Portillo' },
    { key: 'sc_6', name: 'La Luna' },
    { key: 'sc_7', name: 'Huayacan' },
];


function MainSection(){
    //Habilitar estado global para guardado
    const { metadata, secciones,setMetadata } = useFormStore();
    const [isEnabled, SetIsEnabled] = useState(true);

    const handleEnviarDatos = () => {
        if(!metadata.sucursal || !metadata.fecha){
            alert("Por favor, registre la sucursal y la fecha antes de enviar.");
            return;
        }

        //Obtener fecha de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const nombreCarpeta = `Reporte_${metadata.sucursal}_${hoy}`;

        //CREACION DE TEXTO PLANO
        let contenidoTxt = `========================================\n`;
        contenidoTxt += `      REPORTE DE AUDITORÍA - IN-TIME\n`;
        contenidoTxt += `========================================\n\n`;
        contenidoTxt += `SUCURSAL: ${metadata.sucursal}\n`;
        contenidoTxt += `FECHA DE REGISTRO: ${metadata.fecha}\n`;
        contenidoTxt += `FECHA DE ENVÍO: ${hoy}\n`;
        contenidoTxt += `----------------------------------------\n\n`;

        Object.keys(secciones).forEach((seccionKey) => {
            contenidoTxt += `[${seccionKey.toUpperCase()}]\n`;

            const preguntas = secciones[seccionKey];
            if(!preguntas || preguntas.length === 0){
                contenidoTxt += `  Sin respuestas registradas.\n\n`;
                return;
            }

            preguntas.forEach((p) => {
                
                contenidoTxt += `  Pregunta ${p.pregunta}: RESPUESTA: ${p.respuesta || 'N/A'}\n`;
                
                if(p.respuesta === 'NO'){
                    contenidoTxt += `    - Observaciones: ${p.observaciones || 'Sin observaciones'}\n`;
                    const totalFotos = p.fotos ? p.fotos.filter(f => f!= null).length : 0;
                    contenidoTxt += `    - Fotos capturadas: ${totalFotos}\n`;
                }
                contenidoTxt += `\n`;
            });
            contenidoTxt += `----------------------------------------\n`;
        });

        //Descarga de prueba
        const blobTxt = new Blob([contenidoTxt], {type: 'text/plain;charset=utf-8'});
        const urlTxt = URL.createObjectURL(blobTxt);
        const linkTxt = document.createElement('a');
        linkTxt.href = urlTxt;
        linkTxt.download = `${nombreCarpeta}/reporte_${metadata.sucursal.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(linkTxt);
        linkTxt.click()
        document.body.removeChild(linkTxt);
        URL.revokeObjectURL(urlTxt);


        //PROCESAR E IDENTIFICAR IMAGENES
        Object.keys(secciones).forEach((seccionKey) => {
            const preguntas = secciones[seccionKey];

            //Las fotos pertenecen a la respuesta NO
            preguntas.forEach((p) => {
                if(p.respuesta === 'NO' && p.fotos && Array.isArray(p.fotos)){
                    p.fotos.forEach((fotoFile,index) => {
                        if(fotoFile && fotoFile instanceof File){
                            const extension = fotoFile.name.split('.').pop() || 'png';
                            const nombreImagen = `${seccionKey}_q${p.pregunta}_falla${index + 1}.${extension}`;
                            
                            // Descarga de prueba de la imagen simulando la carpeta
                            const urlFoto = URL.createObjectURL(fotoFile);
                            const linkFoto = document.createElement('a');
                            linkFoto.href = urlFoto;
                            
                            // Al usar la diagonal '/', simulamos la estructura de directorios en la descarga
                            linkFoto.download = `${nombreCarpeta}/${nombreImagen}`;
                            document.body.appendChild(linkFoto);
                            linkFoto.click();
                            document.body.removeChild(linkFoto);
                            URL.revokeObjectURL(urlFoto);

                            console.log(`Procesada localmente: ${nombreImagen} lista para Drive.`);
                        }
                    }); 
                }
            });
        });
        alert('Proceso completado');
    }
    return(
        <div className="container d-flex flex-column py-3 gap-2 w-75">
            <h6 className="text-center display-6">SUCURSAL PROVENIENTE</h6>
            
            <select className="form-control" value={metadata.sucursal} 
             onChange={(e) => { setMetadata(e.target.value, metadata.fecha) }}>
                Sucursal
                { 
                    sucursales?.map((sc) => (
                        <option key={sc.key} value={sc.name}>{sc.name}</option>
                        )) 
                }
            </select>

            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" value={metadata.fecha}
                onChange={(e) => setMetadata(metadata.fecha, e.target.value)}/>

            <div className="text-center alert alert-danger rounded p-3">
                <div className="form-check-inline">
                    <input className="form-check-input me-2" type="checkbox" onClick={() => SetIsEnabled(!isEnabled)}/>
                    <label className="form-check-label">
                        Todo listo para enviar
                    </label>
                </div>     
                
                <button onClick={handleEnviarDatos} className="btn btn-primary btn-lg" disabled={isEnabled}>
                    Enviar Datos
                </button>
            </div>
        </div>
    )
}

export default MainSection