import { useFormStore } from "../store/useFormStore";
import { BotonDrive } from "./upload_drive.jsx";

const sucursales = [
    { key: 'sc_0', name: 'Elegir' },
    { key: 'sc_1', name: 'Cancun Av Tulum' }, { key: 'sc_2', name: 'Tankah' },
    { key: 'sc_3', name: 'Talleres' }, { key: 'sc_4', name: 'Isla Mujeres' },
    { key: 'sc_5', name: 'Portillo' }, { key: 'sc_6', name: 'La Luna' },
    { key: 'sc_7', name: 'Huayacan' },
];

function MainSection(){
    //Habilitar estado global para guardado
    const { metadata, setMetadata } = useFormStore();
    
    return(
        <div className="container d-flex flex-column py-3 gap-3 w-75">
            <h6 className="text-center display-6">SUCURSAL PROVENIENTE</h6>
            
            <select className="form-control" value={metadata.sucursal} 
                onChange={(e) => { setMetadata(e.target.value, metadata.fecha) }}>
                { sucursales?.map((sc) => (
                        <option key={sc.key} value={sc.name}>{sc.name}</option>)) }
            </select>

            <div className="input-group">
                <label className="col-form-label me-3">Fecha: </label>
                <input className="form-control" type="date" value={metadata.fecha}
                    onChange={(e) => setMetadata(metadata.fecha, e.target.value)}/>
            </div>
            <BotonDrive/>
            <small>Las respuestas registradas se guardan automaticamente.</small> 
        </div>
    )
}

export default MainSection