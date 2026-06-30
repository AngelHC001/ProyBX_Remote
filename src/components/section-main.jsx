import { useFormStore } from "../store/useFormStore";
import { BotonDrive } from "./upload_drive.jsx";
import { useAuth } from "../../backend/auth_context.jsx";
import { useEffect } from "react";
/*
const sucursales = [
    { key: 'sc_0', name: 'Elegir Sucursal' },
    { key: 'sc_1', name: 'Cancun Av Tulum' }, { key: 'sc_2', name: 'Tankah' },
    { key: 'sc_3', name: 'Talleres' }, { key: 'sc_4', name: 'Isla Mujeres' },
    { key: 'sc_5', name: 'Portillo' }, { key: 'sc_6', name: 'La Luna' },
    { key: 'sc_7', name: 'Huayacan' },
];
 { sucursales?.map((sc) => (
                        <option key={sc.key} value={sc.name}>{sc.name}</option>)) }
*/

function MainSection(){
    //Habilitar estado global para guardado
    const { user } = useAuth();
    const { metadata, setSucursal, setFecha } = useFormStore();
    
    //ATENCION A FALLAS
    useEffect(() => {
        setSucursal(user.sucursal);
        setFecha();
    });

    return(
        <div className="container d-flex flex-column py-3 gap-3 w-75">
            <h3 className="text-center">Modulo Centralizado de Carga de Archivos</h3>

            <small>Responder a los casos en cuestión en las secciones dadas (SI, NO, N/A) </small> 
            <small>En caso de una falla (NO), tomar la foto correspondiente y observaciones</small>
            <small>Una vez completado, confirmar todo listo y cargar los datos</small>    

            <h2>Datos de la Auditoría</h2>
            <div className="input-group">
                <label className="col-form-label me-3">Sucursal y Fecha</label>
                <input className="form-control" type="text" value={metadata.sucursal} readOnly/>
                <input className="form-control" type="date" value={metadata.fecha} readOnly/>
            </div>
            <BotonDrive/>
        </div>
    )
}

export default MainSection