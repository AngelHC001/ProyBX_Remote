import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1009006845166-vih241dp8qk436grf4lmq6ploupieuko.apps.googleusercontent.com">
        <App/>
    </GoogleOAuthProvider>
  </StrictMode>,
)
