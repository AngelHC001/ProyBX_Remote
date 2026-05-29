import { useState } from "react";
import {useView} from './view_context';


//Cada pregunta tiene (si, no, N/A)
//Al decir no, abrir campos (3 fotos y observaciones)

function NegativeCase({section, num}){
    const fields = []

    for (let index = 0; index < 3; index++) {
        fields.push(
            <div key={section + index}>
                <label>FALLO_{section} {num}.{index + 1}</label>
                <label className="container placeholder-box">
                    <i className="bi bi-camera"/>
                    <input className="d-none" type="file" accept="image/*" capture="environment"/>
                </label>
            </div>
        )
    }

    return(
        <div className="container w-50 d-flex flex-column gap-2">
            { fields }
            <label>Observaciones</label>
            <div>
                <textarea className="form-control"></textarea>
            </div>
        </div>
    )
}


function Question({num, txt}){
    const {activeView} = useView();
    const [selected, setSelected] = useState('')

    const handleChange = (value) => { setSelected(value); }

    //La pregunta maneja Valores SI, NO, N/A -> solo se elige 1
    //En caso de no, despliega 3 campos de archivos  
 
    //Enviarlos en un json
    /* 
    {
        seccion: [
            {pregunta: 1, respuesta: '#', imagenes:'fallo1-fallo2-fallo3'}
            ...
            {pregunta: n, respuesta: '#', imagenes:'fallo1-fallo2-fallo3'}
        ]
    }
    
    */

    return(
        <div className="p-2">
            <label className="mb-1">{num}. {txt}</label>
            
            <div className="d-flex justify-content-center gap-2">       
                {
                    ['SI','NO','N/A'].map((option) => (
                        <label key={option} className={`btn btn-lg ${selected === option ? 'btn-danger': 'btn-outline-danger'}`}>
                            <input name={`${activeView}-${num}`} 
                                className="d-none" 
                                type="radio" 
                                onChange={() => handleChange(option)}
                                checked={selected === option}/>
                            {option}
                        </label>
                    ))
                }
            </div>
            
            {selected === 'NO' && (<NegativeCase section={activeView.type} num={num}/>)} 
        </div>
    )
}

export default Question;
