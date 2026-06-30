import { useState } from "react";
import { useAuth } from "../../backend/auth_context";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login(){
    const [userdata, setUserData] = useState({username: '', password: ''})
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setUserData((prev) => ({...prev, [name]:value}));
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`,{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({username: userdata.username, password: userdata.password}),
                credentials: 'include'
            });

            const data = await response.json();
           
            if(!response.ok){
                throw new Error(data.message || 'Ocurrio un error');
            }

            login(data.user, data.token);
        } catch (error) {
            setError(error.message);
        }finally{
            setLoading(false);
        }

    }

    return(
        
    // Contenedor principal: Flexbox centrado y 100% del alto de la pantalla
  
    <div className="login-bg container-fluid d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }}>
        
        <div className="card-body">
          {/* Encabezado del Sistema de Auditoría */}
          <div className="text-center mb-4">
            <h1 className="fw-bold text-danger">Boxito</h1>
            <h3 className="fw-bold text-danger">Módulo de Auditoría</h3>
            <h5>Cancún, México</h5>
            <hr/>
            <p className="text-muted small">Ingresa tus credenciales de acceso exclusivo</p>
          </div>

          {/* Manejo de Errores */}
          {error && (
            <div className="alert alert-danger py-2 text-center small" role="alert">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Campo Usuario */}
            <div className="form-group mb-3">
              <label className="form-label small fw-semibold">Usuario</label>
              <input type="text" name="username" className="form-control" placeholder="ej. bxSucursal"
                value={userdata.username} onChange={handleChange}
                required disabled={loading}/>
            </div>

            {/* Campo Contraseña */}
            <div className="form-group mb-4">
              <label className="form-label small fw-semibold">Contraseña</label>
              <input type="password" name="password" className="form-control" placeholder="••••••••"
                value={userdata.password} onChange={handleChange}
                required disabled={loading}/>
            </div>

            {/* Botón de Acción */}
            <button type="submit"
              className="btn btn-danger w-100 fw-bold py-2 d-flex justify-content-center align-items-center"
              disabled={loading}>
              {loading ? 
                (<>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Autenticando...</>) 
                :
                ('Iniciar Sesión')}
            </button>
          </form>
        </div>

      </div>
    </div>
    
);
}