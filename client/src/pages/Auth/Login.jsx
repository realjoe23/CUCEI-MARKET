// ============================================================
// src/pages/Auth/Login.jsx
//
// Pantalla de inicio de sesión.
// Fusionado: UI original + Backend en Node.js/Supabase
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth(); // Ya no sacamos resetPassword de aquí por ahora
  const navigate = useNavigate();

  // ── Estado del formulario ─────────────────────────────────
  const [role, setRole]       = useState('vendedor');   // 'vendedor' | 'administrador'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);

  // ── Estado de UI ──────────────────────────────────────────
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // ── Submit del formulario (Conectado a Node.js) ───────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamamos a nuestra función del contexto que hace el fetch a localhost:3001
      const result = await login(email, password);
      
      // Obtenemos el rol REAL de la base de datos
      const userRole = result.user.rol;

      // Redirigimos basados en la verdad de la base de datos, no solo en el tab
      if (userRole === 'admin' || userRole === 'administrador') {
        navigate('/admin');
      } else {
        navigate('/seller');
      }

    } catch (err) {
      // Mostramos el error exacto que nos escupió Node.js
      setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Restablecer contraseña (Temporal) ──────────────────────
  const handleResetPassword = () => {
    alert("🔧 La recuperación de contraseña vía correo está en construcción para el nuevo servidor de NEXOCODE.");
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">🏪</div>
        <h1>CUCEI Market</h1>

        {/* Tabs de rol */}
        <div className="role-tabs" role="tablist" aria-label="Tipo de usuario">
          <button
            className={`role-tab ${role === 'vendedor' ? 'active' : ''}`}
            onClick={() => { setRole('vendedor'); setError(''); }}
            role="tab"
            aria-selected={role === 'vendedor'}
          >
            Alumno
          </button>
          <button
            className={`role-tab ${role === 'administrador' ? 'active admin' : ''}`}
            onClick={() => { setRole('administrador'); setError(''); }}
            role="tab"
            aria-selected={role === 'administrador'}
          >
            Administrador
          </button>
        </div>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Correo */}
          <div className="input-group">
            <label htmlFor="login-email">Correo universitario</label>
            <input
              id="login-email"
              type="email"
              placeholder={
                role === 'vendedor'
                  ? 'usuario@alumnos.udg.mx'
                  : 'admin@cucei.udg.mx'
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="input-group">
            <label htmlFor="login-password">Contraseña</label>
            <div className="pw-wrap">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((prev) => !prev)}
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && <p className="auth-error" role="alert">{error}</p>}

          {/* Botón principal */}
          <button
            type="submit"
            className={`btn-auth ${role === 'administrador' ? 'admin' : ''}`}
            disabled={loading}
          >
            {loading ? 'Verificando en servidor...' : 'Ingresar'}
          </button>

        </form>

        {/* Restablecer contraseña */}
        <button
          className="btn-link"
          onClick={handleResetPassword}
          type="button"
        >
          ¿Olvidaste tu contraseña?
        </button>

        {/* Link a registro (solo para alumnos) */}
        {role === 'vendedor' && (
          <>
            <div className="auth-divider"><span>o</span></div>
            <Link to="/register" className="btn-auth-secondary">
              Crear cuenta de vendedor
            </Link>
          </>
        )}

      </div>
    </div>
  );
}