import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Punto de entrada principal de la aplicación React
 * Configura el renderizado con StrictMode para mejores prácticas de desarrollo
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
) 