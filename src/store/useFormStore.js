import { create } from "zustand";


//Estructura inicial del JSON
//Acumulado de datos

//los arrays de secciones almacenan
//{ pregunta: 1, respuesta:'#', fotos:[], observaciones: ''}
const getFechaHoy = ()=>{
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
    return fechaLocal.toISOString().split('T')[0];
}


export const useFormStore = create((set) => ({
        //ESTRUCTURA INICIAL DEL JSON
        metadata : {
            sucursal:'',
            fecha: getFechaHoy()
        },
        secciones:{
            caja:[],
            alcn:[],
            sala:[],
            edif:[]
        },

        //Guardar sucursal y fecha por separado
        setSucursal: (sucursal) => set((state) => ({
            metadata: {
                ...state.metadata, //conserva
                sucursal: sucursal
            }
        })),

        setFecha: (fecha) => set((state) => ({
            metadata: {
                ...state.metadata, //conserva
                fecha: fecha
            }
        })),     

        //Guardar o actualizar una pregunta de las secciones
        setRespuesta: (seccion,idPregunta,respuesta,observaciones='',fotos=[]) => set((state) => {
            const preguntasActuales = state.secciones[seccion] || [];

            //Si la pregunta ya existe para actualizarla, si no, la agrega
            const index = preguntasActuales.findIndex((p) => p.pregunta === idPregunta);
            let nuevasPreguntas = [...preguntasActuales];

            const nuevaDataPregunta = {
                pregunta: idPregunta,
                respuesta,
                observaciones,
                fotos //es un array de hasta 3 fotos
            }

            if(index !== -1){
                nuevasPreguntas[index] = nuevaDataPregunta;
            }else{
                nuevasPreguntas.push(nuevaDataPregunta)
            }

            return {
                secciones: {
                    ...state.secciones,
                    [seccion]:nuevasPreguntas
                }
            };
        }),

        //LIMPIAR AL TERMINAR
        resetForm: () => set({
            metadata: { sucursal: '', fecha: getFechaHoy() },
            secciones: { caja: [], alcn: [], sala: [], edif: [] }
        })
}));



