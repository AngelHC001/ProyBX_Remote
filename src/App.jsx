import { useState } from "react";
import { ViewContext } from './components/view_context.jsx';

import Section from "./components/section-template.jsx";


const pestañas = [
  {
    key: 'bx1',
    index: 'main',
    btnName: 'Sucursal'
  },
  {
    key: 'bx2',
    index: 'caja',
    btnName: 'Caja'
  },
  {
    key: 'bx3',
    index: 'alcn',
    btnName: 'Almacen'
  },
  {
    key: 'bx4',
    index: 'sala',
    btnName: 'Sala'
  },
  {
    key: 'bx5',
    index: 'edif',
    btnName: 'Edificio'
  }
]


function App() {
  const [activeView, setActiveView] = useState({type: 'main'});
  
  return (
    <div className="container-fluid">    
      <h1 className="display-5 p-1"> <i className="bi bi-clipboard2-check"/> Checklist</h1>
      <hr />

      <div className="d-flex flex-wrap flex-sm-wrap justify-content-center gap-2">
        { pestañas.map(p => ( 
            <button key={p.key} 
              className={`btn border-bottom-0 btn-lg ${activeView.type === p.index ? 'btn-danger' :'btn btn-outline-danger'}`}
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

export default App
