import { create } from "zustand";


//Estructura inicial del JSON
//Acumulado de datos

//los arrays de secciones almacenan
//{ pregunta: 1, respuesta:'#', fotos:[], observaciones: ''}

export const useFormStore = create((set) => ({
        //ESTRUCTURA INICIAL DEL JSON
        metadata : {
            sucursal:'',
            fecha:''
        },
        secciones:{
            caja:[],
            alcn:[],
            sala:[],
            edif:[]
        },

        //Guardar sucursal y fecha
        setMetadata: (sucursal,fecha) => set((state) => ({
            metadata: { sucursal,fecha }
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
            metadata: { sucursal: '', fecha: '' },
            secciones: { caja: [], alcn: [], sala: [], edif: [] }
        })
}));



