import { Navigate,Outlet } from "react-router-dom";
import { useAuth } from "../../backend/auth_context";

export const ProtectedRoute = () => {
    const {user, token} = useAuth();

    console.log(user)
    console.log(token);
        

    //SI NO HAY TOKEN O USUARIO
    if(!token || !user){
        return <Navigate to={'/login'} replace/>
    }

    //SI TODO ESTA EN ORDEN RENDERIZA HIJOS
    return <Outlet/>
} 