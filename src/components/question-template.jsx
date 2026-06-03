import { useView } from './view_context';
import { useFormStore } from "../store/useFormStore";
import { ImagePreview } from './image_preview';

//Cada pregunta tiene (SI, NO, N/A)

function Question({idPregunta, txt}){
    const { activeView } = useView();
    const { setRespuesta } = useFormStore();

    //La pregunta tiene datos guardados?
    const preguntaGuardada = useFormStore((state) => 
        state.secciones[activeView.type]?.find(p => p.pregunta === idPregunta)    
    );

    //Estados locales temporales
    const respuesta = preguntaGuardada?.respuesta || '';
    const observaciones = preguntaGuardada?.observaciones || '';
    const fotos = preguntaGuardada?.fotos || [];

    //Organizar Guardado de datos
    const guardarCambios = (updates) => {
        setRespuesta(
            activeView.type,
            idPregunta,
            updates.respuesta !== undefined ? updates.respuesta : respuesta,
            updates.observaciones !== undefined ? updates.observaciones : observaciones,
            updates.fotos !== undefined ? updates.fotos : fotos
        );
    };

     const handlePictures = (e, index) =>{
        const file =  e.target.files[0];
        if(file){
            const actualesFotos = Array.isArray(fotos) ? [...fotos] : [];
            actualesFotos[index] = file;
            guardarCambios({fotos: actualesFotos})
        }
        e.target.value = '';
    }

    //NEGATIVE CASE FIELDS
    const fields = []

    for (let index = 0; index < 3; index++) {
        fields.push(
            <div key={activeView.type + index}>
                <label>FALLO_{activeView.type} {idPregunta}.{index + 1}</label>
                {
                    fotos && fotos[index] ? 
                            (<ImagePreview file={fotos[index]} 
                                onRemove={() => {
                                    const nuevasFotos = [...fotos];
                                    nuevasFotos[index] = null; //Vaciar
                                    guardarCambios({ fotos: nuevasFotos });
                                }}
                                onRetake={ () => {
                                    document.getElementById(`input-file-${idPregunta}-${index}`).click();
                                }}
                            />)
                            :
                            (<label className="container placeholder-box">
                                    <i className="bi bi-camera"/>
                                    <input className="d-none" type="file" accept="image/*" 
                                        capture="environment"
                                        onChange={(e) => handlePictures(e,index)} 
                                    />
                            </label>)           
                }

                <input id={`input-file-${idPregunta}-${index}`}
                    type="file" className="d-none"
                    accept="image/*" capture="environment"
                    onChange={(e) => handlePictures(e, index)}
                />

            </div>)
    }

    return(
        <div className="p-2">
            <label className="mb-1">{idPregunta}. {txt}</label>
            
            <div className="d-flex justify-content-center gap-2">       
                {
                    ['SI','NO','N/A'].map((option) => (
                        <label key={option} className={`btn btn-lg ${respuesta === option ? 'btn-danger': 'btn-outline-danger'}`}>
                            <input name={`${activeView}-${idPregunta}`} 
                                className="d-none" 
                                type="radio" 
                                onChange={() => guardarCambios({respuesta:option})}
                                checked={respuesta === option}/>
                            {option}
                        </label>
                    ))
                }
            </div>
            

            {/*Al decir NO, abrir campos (3 fotos y observaciones)*/}
            {
                respuesta === 'NO' && 
                    (<div className="container w-50 d-flex flex-column gap-2">
                        { fields }
                        <label>Observaciones</label>
                        <textarea className="form-control" value={observaciones}
                        onChange={(e) => guardarCambios({observaciones: e.target.value})}/>
                    </div>)
            }
        </div>
    )
}

export default Question;





