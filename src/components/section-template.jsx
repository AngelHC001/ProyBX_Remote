import { useContext, useState } from "react";
import { ViewContext } from "./view_context";
import { useFormStore } from "../store/useFormStore";

import Question from './question-template';
import SectionDict from '../assets/questions_dict.json'
import '../App.css';

//como acumular?
// como formatear?
// metodo de envio a drive?



/* 
Es de funcion online
por lo que entiendo la aplicacion es de uso In-time
mi siguiente paso seria subir los datos a un drive (un txt y las imagenes)
pero quiero enfocarme primero en esta fase del guardado
*/


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
    const { metadata, setMetadata } = useFormStore();
    const [isEnabled, SetIsEnabled] = useState(true);
   
    //const handleSiguiente = () => {
        // Validar y guardar en el estado global antes de cambiar de sección
        //setMetadata(valorSucursal, valorFecha);
        // Aquí ejecutas tu lógica para cambiar a la Sección 2
    //};

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
                
                <button className="btn btn-primary btn-lg" disabled={isEnabled}>
                    Enviar Datos
                </button>
            </div>
        </div>
    )
}


function Section(){
    const { activeView } = useContext(ViewContext);
    const SeccionCaja = SectionDict.caja;
    const SeccionAlcn = SectionDict.almacen;
    const SeccionSala = SectionDict.sala;
    const SeccionEdif = SectionDict.edificio; 
    
    return(
        <div className="col question-space text-center">
            {activeView.type === 'main' && <MainSection/>}

            {activeView.type === 'caja' && SeccionCaja?.map((q,index) => 
                (<Question key={q?.key} idPregunta={index + 1} txt={q.pregunta}/>)) }

            {activeView.type === 'alcn' && SeccionAlcn?.map((q,index) => 
                (<Question key={q?.key} idPregunta={index + 1} txt={q.pregunta}/>)) }

            {activeView.type === 'sala' && SeccionSala?.map((q,index) => 
                (<Question key={q?.key} idPregunta={index + 1} txt={q.pregunta}/>)) }

            {activeView.type === 'edif' && SeccionEdif?.map((q,index) => 
                (<Question key={q?.key} idPregunta={index + 1} txt={q.pregunta}/>)) }
        </div>
    )
}

export default Section;