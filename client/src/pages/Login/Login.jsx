import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export function LogoArea() {
  return (
    <div className="logo-area">
      <div className="logo-icon">
        <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
          <rect x="4"  y="8"  width="18" height="16" rx="3" fill="#185FA5"/>
          <rect x="10" y="4"  width="18" height="16" rx="3" fill="#85B7EB"/>
          <rect x="12" y="14" width="6"  height="8"  rx="1.5" fill="#fff"/>
        </svg>
      </div>
      <h1>Cucei Market</h1>
      <p>Marketplace universitario CUCEI · UdG</p>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [role,      setRole]      = useState('alumno')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [error,     setError]     = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)

  const handleLogin = async () => {
    setError('')
    setResetSent(false)
    if (!email || !password) return setError('Por favor llena todos los campos.')

    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password)

      if (!credential.user.emailVerified) {
        await auth.signOut()
        setError('Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada y spam.')
        return
      }

      setSuccess(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    if (!email) return setError('Escribe tu correo arriba para recibir el enlace.')
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim())
      setResetSent(true)
    } catch {
      setError('No encontramos una cuenta con ese correo.')
    }
  }

  if (success) {
    return (
      <div className="login-page">
        <div className="login-container">
          <LogoArea />
          <div className="login-card">
            <div className="success-wrap">
              <div className="success-avatar">🎉</div>
              <h3>{role === 'admin' ? '¡Bienvenido, Admin!' : '¡Bienvenido!'}</h3>
              <p>{role === 'admin' ? 'Cargando panel de administrador...' : 'Redirigiendo a tu perfil de vendedor...'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <LogoArea />
        <div className="login-card">

          {/* Role toggle */}
          <div className="role-toggle">
            <button
              className={`role-btn ${role === 'alumno' ? 'active' : ''}`}
              onClick={() => { setRole('alumno'); setError('') }}
            >
              Alumno
            </button>
            <button
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError('') }}
            >
              Administrador
            </button>
          </div>

          {error     && <div className="alert-error">{error}</div>}
          {resetSent && <div className="alert-success">¡Enlace enviado! Revisa tu correo y spam.</div>}

          {role === 'admin' && (
            <div><span className="admin-badge">🔐 Acceso Administrador</span></div>
          )}

          <p className="section-title">Iniciar sesión</p>

          {/* Email */}
          <div className="field">
            <label>{role === 'admin' ? 'Correo institucional' : 'Código de estudiante o Correo'}</label>
            <input
              type="email"
              placeholder={role === 'admin' ? 'admin@cucei.udg.mx' : 'usuario@alumnos.udg.mx'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Password */}
          <div className="field">
            <label>Contraseña</label>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="forgot">
            <button onClick={handleForgotPassword}>¿Olvidaste tu contraseña?</button>
          </div>

          <button
            className={`btn-primary ${role === 'admin' ? 'admin' : ''}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>

          {role === 'alumno' && (
            <>
              <div className="divider">o</div>
              <button className="btn-secondary" onClick={() => navigate('/register')}>
                Crear nueva cuenta
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
