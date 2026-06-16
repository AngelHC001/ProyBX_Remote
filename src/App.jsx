import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../backend/auth_context.jsx" 
import MainPage from "./pages/main-page.jsx";
import Login from "./pages/login.jsx";

function App() {
  const {user, accessToken} = useAuth() || {};
  
  return (
      <Routes>
        {/* RUTA DEL LOGIN*/}
        <Route path="/login" element={ accessToken && user ? 
                          <Navigate to={'/checklist'} replace/> : <Login/>}/>

        {/* La pagina principal*/}
        <Route path="/checklist" element={ accessToken && user ? <MainPage/> : 
                                      <Navigate to={'/login'} replace/> }/> 

        {/* fallback */}
        <Route path="*" element={<Navigate to={'/login'}/>}/>
      </Routes> 
  )
}

export default App
