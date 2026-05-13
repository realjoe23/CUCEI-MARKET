import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Importa tu interfaz principal
import './index.css'      // Importa los estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)