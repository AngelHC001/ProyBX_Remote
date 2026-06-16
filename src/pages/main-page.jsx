import { useState } from "react";
import {useAuth} from '../../backend/auth_context.jsx'
import { ViewContext } from '../components/view_context.jsx';
import Section from "../components/section-template.jsx";

import bxLogo from '../store/bxLogo.webp';
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
            <div className="d-flex align-items-center justify-content-between p-2 border-bottom border-2 mb-2 gap-2">
                
                <div className="d-flex align-items-center gap-2">
                  <img className="img-fluid p-2 rounded bg-danger" src={bxLogo} alt="bxLogo" 
                  style={{objectFit: 'cover', maxHeight: '55px'}} />
                  <h1 className="header-check">Cancún Checklist</h1>
                  <i className="fs-1 bi bi-clipboard2-check text-danger"/> 
                </div>
               
                <span className="badge rounded-pill text-bg-danger d-flex align-items-center">
                  Sucursal: {user.sucursal}
                </span>

                <button className="btn btn-danger btn-sm rounded-pill" 
                  onClick={() => logout()} title="Cerrar Sesion">
                    <i className="fs-3 bi bi-box-arrow-left"/>
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