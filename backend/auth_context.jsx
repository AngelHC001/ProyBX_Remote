import { createContext, useState, useContext } from "react";

//CREAR VARIABLE
export const AuthContext = createContext(null);

//CREAR HOOK
export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
   
    const login = (userData, userToken) => {
        setUser(userData);
        setAccessToken(userToken);
    }

    const logout = () => {
        setUser(null);
        setAccessToken(null);
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

    return (<AuthContext.Provider value={{user, accessToken, login, logout, authFetch}}>
                {children}
            </AuthContext.Provider>)
}

export const useAuth = () => useContext(AuthContext);
