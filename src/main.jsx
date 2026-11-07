import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import App from './App.jsx'
import { registrarSW } from './registrarSW.js'

registrarSW()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
