import { useState } from "react";



//Cada pregunta tiene (si, no, N/A)
//Al decir no, abrir campos (3 fotos y observaciones)

function NegativeCase({num}){
    return(
        <div className="container w-50 d-flex flex-column gap-2">
            <label >FALLO_{num}.1</label>
            <input className="form-control" type="file" accept="image/*"/>
            <label >FALLO_{num}.2</label>
            <input className="form-control" type="file" accept="image/*"/>
            <label >FALLO_{num}.3</label>
            <input className="form-control" type="file" accept="image/*"/>

            <label>Observaciones</label>
            <div>
                <textarea className="form-control"></textarea>
            </div>
        </div>
    )
}


function Question({num, txt}){
    //const [answers, setAnswers] = useState({optionYes:false, optionNo:false, optionNan:false})
    const [selected, setSelected] = useState('')

    const handleChange = (value) => {
        setSelected(value);
    }

    //manejar valores
 

    return(
        <div className="p-2">
            <label>{num}. {txt}</label>
            
            <div className="d-flex justify-content-center gap-2 mb-2">       
                {
                    ['SI','NO','N/A'].map((option) => (
                        <label key={option} className={`btn btn-lg ${selected === option ? 'btn-secondary': 'btn-outline-secondary'}`}>
                            <input name={`question-${num}`} 
                                className="d-none" 
                                type="radio" 
                                onChange={() => handleChange(option)}
                                checked={selected === option}/>
                            {option}
                        </label>
                    ))
                }
            </div>
            
            {selected === 'NO' && (<NegativeCase num={num}/>)} 
        </div>
    )
}

export default Question;
