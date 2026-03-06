import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.scss'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { MeProfileProvider } from './profile/MeProfileContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MeProfileProvider>
          <App />
        </MeProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
