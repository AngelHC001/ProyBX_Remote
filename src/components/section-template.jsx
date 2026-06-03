import { useContext } from "react";
import { ViewContext } from "./view_context";

import MainSection from "./section-main";
import Question from './question-template';
import SectionDict from '../assets/questions_dict.json'
import '../App.css';

// como acumular?
// como formatear?
// metodo de envio a drive?

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