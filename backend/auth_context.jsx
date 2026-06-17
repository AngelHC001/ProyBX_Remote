import { createContext, useState, useContext, useEffect } from "react";
import { useFormStore } from '../src/store/useFormStore.js';

const API_URL = import.meta.env.VITE_API_URL;
//CREAR VARIABLE
export const AuthContext = createContext(null);

//CREAR HOOK
export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const { resetForm } = useFormStore();
   
    //Verificar sesion
    useEffect(() => {
        const verificarSesion = async() => {
            try {
                const response = await fetch(`${API_URL}/auth/verify`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if(response.ok){
                    const data = await response.json();
                    setUser(data.user);
                    setAccessToken(data.token);
                }
            } catch (error) {
                console.log('Sin sesion previa o token expiro');
            }
            finally{
                setLoading(false);
            }
        }

        verificarSesion();
    },[]);

    const login = (userData, userToken) => {
        setUser(userData);
        setAccessToken(userToken);
    }

    const logout = async() => {
        try {
            //RETIRAR LA COOKIE
            await fetch('http://localhost:8080/auth/verify',{
                method: 'GET',
                credentials: 'include'
            });
        } catch (error) {
            console.error("Error al revocar cookie en servidor", error);
        } 
        finally{
            setUser(null);
            setAccessToken(null);
            resetForm();
        }
    }

    const authFetch = (url, options ={}) => {
        return fetch(url,{
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    };

    //BLOQUEO DE SEGURIDAD
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <h3>Comprobando credenciales seguras...</h3>
            </div>);
    }

    return (<AuthContext.Provider value={{user, accessToken, login, logout, authFetch}}>
                {children}
            </AuthContext.Provider>)
}

export const useAuth = () => useContext(AuthContext);
