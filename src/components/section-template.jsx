import { useContext, useState } from "react";
import { ViewContext } from "./view_context";

import Question from './question-template';
import SectionDict from '../assets/questions_dict.json'
import '../App.css';

//marca de guardado para acumular info

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
    const [isEnabled, SetIsEnabled] = useState(true);

    return(
        <div className="container d-flex flex-column py-3 gap-2 w-75">
            <h6 className="text-center display-6">SUCURSAL PROVENIENTE</h6>
            <select className="form-control">Sucursal
                { 
                    sucursales?.map((sc) => (
                        <option key={sc.key}>{sc.name}</option>
                        )) 
                }
            </select>

            <label className="form-label">Fecha</label>
            <input className="form-control" type="date"/>

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
                (<Question key={q?.key} num={index + 1} txt={q.pregunta}/>)) }

            {activeView.type === 'alcn' && SeccionAlcn?.map((q,index) => 
                (<Question key={q?.key} num={index + 1} txt={q.pregunta}/>)) }

            {activeView.type === 'sala' && SeccionSala?.map((q,index) => 
                (<Question key={q?.key} num={index + 1} txt={q.pregunta}/>)) }

            {activeView.type === 'edif' && SeccionEdif?.map((q,index) => 
                (<Question key={q?.key} num={index + 1} txt={q.pregunta}/>)) }
        </div>
    )
}

export default Section;