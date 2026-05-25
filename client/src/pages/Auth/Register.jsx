// ============================================================
// src/pages/Auth/Register.jsx
//
// Pantalla de registro exclusiva para alumnos del CUCEI.
// Fusionado: UI/UX original + Backend en Node.js/Supabase
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

// Dominios universitarios aceptados
const ALLOWED_DOMAINS = ['@alumnos.udg.mx', '@udg.mx', '@academicos.udg.mx'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ── Estado del formulario ─────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    code: '',
    email: '',
    password: '',
    confirm: '',
  });
  
  // Nuevo estado para manejar el archivo PDF del Kardex
  const [kardexFile, setKardexFile] = useState(null);

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Estado de UI ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Manejador de inputs ───────────────────────────────────
  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    setKardexFile(e.target.files[0]);
  };

  // ── Validaciones del lado del cliente ────────────────────
  const validate = () => {
    const { name, email, password, confirm } = form;

    if (!name.trim()) return 'El nombre es obligatorio.';

    // Validar dominio universitario
    const hasValidDomain = ALLOWED_DOMAINS.some((d) => email.endsWith(d));
    if (!hasValidDomain) {
      return `Solo se aceptan correos universitarios (${ALLOWED_DOMAINS.join(', ')}).`;
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (password !== confirm) {
      return 'Las contraseñas no coinciden. Verifícalas.';
    }

    // Nueva validación para asegurar que suban el PDF
    if (!kardexFile) {
      return 'Es obligatorio subir tu Kardex certificado en formato PDF.';
    }

    return null; // Sin errores
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Empaquetar todo en FormData para que Multer en Node.js lo entienda
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', `${form.name.trim()} ${form.lastName.trim()}`.trim());
      formDataToSend.append('codigo', form.code.trim());
      formDataToSend.append('correo', form.email.trim());
      formDataToSend.append('password', form.password);
      formDataToSend.append('rol', 'vendedor'); // Rol por defecto
      formDataToSend.append('kardex', kardexFile); // El archivo físico

      // Llamamos a la función register del AuthContext
      await register(formDataToSend);
      
      alert("¡Registro completado! Tu cuenta está en revisión.");
      navigate('/login');
      
    } catch (err) {
      // Mostrar el error exacto que nos mande el servidor Node
      setError(err.message || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Fuerza de contraseña (indicador visual) ───────────────
  const getPasswordStrength = () => {
    const pw = form.password;
    if (!pw) return null;
    if (pw.length < 6)  return { label: 'Muy corta', color: '#ef4444', width: '25%' };
    if (pw.length < 8)  return { label: 'Débil',     color: '#f59e0b', width: '50%' };
    if (pw.length < 12) return { label: 'Regular',   color: '#3b82f6', width: '75%' };
    return               { label: 'Segura',    color: '#22c55e', width: '100%' };
  };

  const strength = getPasswordStrength();

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '440px' }}>

        {/* Logo */}
        <div className="auth-logo">🎓</div>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">
          Exclusivo para alumnos del CUCEI con correo universitario
        </p>

        {/* Formulario */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Nombre y Apellido */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label htmlFor="reg-name">Nombre(s) *</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Juan"
                value={form.name}
                onChange={handleChange('name')}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-lastname">Apellido(s)</label>
              <input
                id="reg-lastname"
                type="text"
                placeholder="García"
                value={form.lastName}
                onChange={handleChange('lastName')}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Código de alumno */}
          <div className="input-group">
            <label htmlFor="reg-code">
              Código de alumno
              <span style={{ color: 'var(--gray-400)', marginLeft: '0.3rem' }}>
                (opcional)
              </span>
            </label>
            <input
              id="reg-code"
              type="text"
              placeholder="Ej. 215700001"
              value={form.code}
              onChange={handleChange('code')}
              maxLength={12}
            />
          </div>

          {/* Correo universitario */}
          <div className="input-group">
            <label htmlFor="reg-email">Correo universitario *</label>
            <input
              id="reg-email"
              type="email"
              placeholder="usuario@alumnos.udg.mx"
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="input-group">
            <label htmlFor="reg-password">Contraseña *</label>
            <div className="pw-wrap">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Indicador de fuerza */}
            {strength && (
              <div className="pw-strength">
                <div className="pw-strength-bar">
                  <div
                    className="pw-strength-fill"
                    style={{
                      width: strength.width,
                      background: strength.color,
                    }}
                  />
                </div>
                <span style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="input-group">
            <label htmlFor="reg-confirm">Confirmar contraseña *</label>
            <div className="pw-wrap">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleChange('confirm')}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Validación en tiempo real */}
            {form.confirm && form.password !== form.confirm && (
              <span style={{ color: 'var(--red-main)', fontSize: '0.78rem' }}>
                Las contraseñas no coinciden
              </span>
            )}
            {form.confirm && form.password === form.confirm && form.confirm.length >= 6 && (
              <span style={{ color: 'var(--green-main)', fontSize: '0.78rem' }}>
                ✓ Las contraseñas coinciden
              </span>
            )}
          </div>

          {/* ZONA NUEVA: Subida de archivo Kardex */}
          <div className="input-group" style={{ marginTop: '10px' }}>
            <label htmlFor="reg-kardex" style={{ color: 'var(--blue-udg)', fontWeight: 'bold' }}>
              KARDEX CERTIFICADO (PDF) *
            </label>
            <div style={{
              border: '2px dashed #ccc', 
              padding: '15px', 
              borderRadius: '6px', 
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}>
              <input
                id="reg-kardex"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
              {kardexFile && (
                <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: 'var(--green-main)' }}>
                  📄 {kardexFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Nota informativa */}
          <p className="register-note" style={{ marginTop: '15px' }}>
            🔒 Al registrarte, tu cuenta quedará en estado{' '}
            <strong>pendiente de aprobación</strong> hasta que el administrador
            revise tu Kardex.
          </p>

          {/* Error */}
          {error && <p className="auth-error" role="alert">{error}</p>}

          {/* Botón principal */}
          <button
            type="submit"
            className="btn-auth"
            disabled={loading}
          >
            {loading ? 'Procesando en el servidor...' : 'Registrarme'}
          </button>

        </form>

        {/* Link a login */}
        <div className="auth-divider"><span>o</span></div>
        <Link to="/login" className="btn-auth-secondary">
          Ya tengo cuenta — Ingresar
        </Link>

      </div>
    </div>
  );
}