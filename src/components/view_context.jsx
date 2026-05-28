import React from "react";
import { createContext, useContext } from "react";

export const ViewContext = createContext(null);

export const useView = () => {
    const ctx = useContext(ViewContext);
    if(!ctx) 
        throw new Error('El contexto debe tener un provider')
    return ctx;
}

