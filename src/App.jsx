import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "../backend/auth_context.jsx" 
import { ProtectedRoute } from './components/protected_route.jsx'
import MainPage from "./pages/main-page.jsx";
import Login from "./pages/login.jsx";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA DEL LOGIN*/}
          <Route path="/login" element={<Login/>}/>

          {/* La pagina principal*/}
          <Route element={<ProtectedRoute/>}>
            <Route path="/checklist" element={<MainPage/>}/>   
          </Route>

          {/* fallback */}
            <Route path="*" element={<Navigate to={'/login'}/>}/>
          

        </Routes>
      </BrowserRouter>
    </AuthProvider>

    

   
  )
}

export default App
