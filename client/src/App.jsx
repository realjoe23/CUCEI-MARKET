import { useState } from 'react'
import './App.css'

function App() {
  // Estados para capturar los datos según el diseño P1
  const [rol, setRol] = useState('vendedor') // Vendedor o Administrador
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Proceso interno: Validar campos y verificar credenciales
    console.log("Iniciando sesión como:", rol, email)
    alert(`Intento de login para ${email} como ${rol}`)
  }

  return (
    <div className="login-wrapper">
      {/* Sección Izquierda: Identidad Visual */}
      <div className="brand-panel">
        <h1>CUCEI Market</h1>
        <p>Sistema de Gestión de Vendedores Estudiantiles</p>
      </div>

      {/* Sección Derecha: Formulario (Prototipo P1) */}
      <div className="form-panel">
        <div className="login-card">
          <h2>Bienvenido</h2>
          <p className="subtitle">Inicia sesión para continuar</p>

          {/* Selector de Rol (Actor) */}
          <div className="role-toggle">
            <button 
              className={rol === 'vendedor' ? 'active' : ''} 
              onClick={() => setRol('vendedor')}
            >
              Soy Vendedor
            </button>
            <button 
              className={rol === 'admin' ? 'active' : ''} 
              onClick={() => setRol('admin')}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-field">
              <label>CORREO INSTITUCIONAL</label>
              <input 
                type="email" 
                placeholder="nombre.usuario@alumnos.udg.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="input-field">
              <label>CONTRASEÑA</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="login-btn">
              Iniciar sesión
            </button>
          </form>

          <a href="#" className="register-link">Crear cuenta nueva</a>
        </div>
      </div>
    </div>
  )
}

export default App