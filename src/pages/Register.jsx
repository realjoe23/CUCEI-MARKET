import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const handleRegister = async () => {
    setError('')
    if (!email || !password || !confirm) return setError('Por favor llena todos los campos.')

    const trimmedEmail = email.toLowerCase().trim()
    if (!trimmedEmail.endsWith('@alumnos.udg.mx') && !trimmedEmail.endsWith('@cucei.udg.mx')) {
      return setError('Solo se permiten correos institucionales de la UDG (@alumnos.udg.mx).')
    }
    if (password.length < 6) return setError('La contraseña debe tener mínimo 6 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')

    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
      await sendEmailVerification(credential.user)
      await signOut(auth)
      setDone(true)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Este correo ya está registrado.')
      else setError('Ocurrió un error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="page-center">
        <div className="card" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <div className="card-header-center">¡Cuenta creada!</div>
          <div className="alert alert-success">
            Te enviamos un enlace de verificación a <strong>{email}</strong>.
            Debes hacer clic en el enlace antes de iniciar sesión.
          </div>
          <br />
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div className="card-header-center">Crear cuenta nueva</div>
        <p style={{ color: 'red', fontSize: 13, marginBottom: 16 }}>
          * Se enviará un enlace real de verificación a este correo.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <input
          className="input-field"
          type="email"
          placeholder="Correo (@alumnos.udg.mx)"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Crea una contraseña (mín. 6 caracteres)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Confirma tu contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />

        <br />
        <button className="btn-gold" onClick={handleRegister} disabled={loading}>
          {loading ? '...' : 'Registrarse'}
        </button>

        <hr className="divider" />

        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary">Volver al inicio de sesión</button>
        </Link>
      </div>
    </div>
  )
}
