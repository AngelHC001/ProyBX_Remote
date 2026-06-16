import { useState } from "react";
import {useAuth} from '../../backend/auth_context.jsx'
import { ViewContext } from '../components/view_context.jsx';
import Section from "../components/section-template.jsx";

const pestañas = [
  { key: 'bx1', index: 'main', btnName: 'Sucursal' },
  { key: 'bx2', index: 'caja', btnName: 'Caja' },
  { key: 'bx3', index: 'alcn', btnName: 'Almacen' },
  { key: 'bx4', index: 'sala', btnName: 'Sala' },
  { key: 'bx5', index: 'edif', btnName: 'Edificio'}
]

export default function MainPage(){
    const { user, logout } = useAuth();    
    const [activeView, setActiveView] = useState({type: 'main'});

    return(
         <div className="container-fluid">    
            <div className="d-flex justify-content-between p-2 border-bottom border-2 mb-2 gap-2">
                <h1 className="fw-2"><i className="bi bi-clipboard2-check"/> Checklist</h1>
                <span className="badge rounded-pill text-bg-danger d-flex align-items-center">
                  Sucursal: {user.sucursal}
                </span>

                <button className="btn btn-danger btn-sm rounded-pill" onClick={() => logout()}>
                    Cerrar Sesion
                </button>
            </div>
          
            <div className="mobile-tabs-container">
              { pestañas.map(p => ( 
                  <button key={p.key} 
                    className={`mobile-tab-btn ${activeView.type === p.index ? 'is-active' :''}`}
                    onClick={() => setActiveView({type: p.index})}>
                      {p.btnName}
                  </button>
              )) }
            </div>

            <div className="container main-section border border-danger border-2 rounded">
              <ViewContext.Provider value={ {activeView, setActiveView} }>
                  <Section/>
              </ViewContext.Provider>
            </div>
          </div>

    )
}