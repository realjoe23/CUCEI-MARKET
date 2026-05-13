import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !password) return setError('Por favor llena tu correo y contraseña.')

    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password)
      if (!credential.user.emailVerified) {
        setError('Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja.')
        await auth.signOut()
      } else {
        navigate('/profile')
      }
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    if (!email) return setError('Escribe tu correo arriba para recibir el enlace de recuperación.')
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim())
      setResetSent(true)
    } catch {
      setError('No encontramos una cuenta con ese correo.')
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div className="card-header-center">Iniciar sesión</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Ingresa tus datos para continuar con el proceso.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {resetSent && <div className="alert alert-success">¡Enlace enviado! Revisa tu correo y spam.</div>}

        <input
          className="input-field"
          type="email"
          placeholder="Correo (@alumnos.udg.mx)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div style={{ position: 'relative' }}>
          <input
            className="input-field"
            type={showPass ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => setShowPass(p => !p)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#666',
            }}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        <div style={{ textAlign: 'right', margin: '6px 0 16px' }}>
          <button
            onClick={handleForgotPassword}
            style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: 13, cursor: 'pointer' }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? '...' : 'Ingresar'}
        </button>

        <hr className="divider" />

        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary">Crear cuenta</button>
        </Link>
      </div>
    </div>
  )
}
