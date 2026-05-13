import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [rol, setRol] = useState('vendedor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Intentando login como ${rol} con correo: ${email}`);
    // TODO: Implementar autenticación con Supabase aquí
  };

  return (
    <div className="login-wrapper">
      <div className="brand-panel">
        <h1>CUCEI Market</h1>
        <p>Sistema de Gestión de Vendedores Estudiantiles</p>
      </div>

      <div className="form-panel">
        <div className="login-card">
          <h2>Bienvenido</h2>
          <p className="subtitle">Inicia sesión para continuar</p>

          <div className="role-toggle">
            <button 
              type="button"
              className={rol === 'vendedor' ? 'active' : ''} 
              onClick={() => setRol('vendedor')}
            >
              Soy Vendedor
            </button>
            <button 
              type="button"
              className={rol === 'admin' ? 'active' : ''} 
              onClick={() => setRol('admin')}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>CORREO INSTITUCIONAL</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@alumnos.udg.mx" 
                required 
              />
            </div>
            <div className="input-group">
              <label>CONTRASEÑA</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
              />
            </div>
            <button type="submit" className="btn-primary">Iniciar sesión →</button>
          </form>

          <Link to="/registro" className="register-link">Crear cuenta nueva</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;