import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'

const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole]           = useState('alumno')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)

  const handleLogin = async () => {
    setError('')
    setResetSent(false)
    if (!email || !password) return setError('Por favor llena todos los campos.')

    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password)

      // Block login if email not verified
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
      <div style={c.page}>
        <div style={c.container}>
          <LogoArea />
          <div style={c.card}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={c.successAvatar}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0C447C', marginBottom: 6 }}>
                {role === 'admin' ? '¡Bienvenido, Admin!' : '¡Bienvenido!'}
              </h3>
              <p style={{ fontSize: 13, color: '#378ADD', lineHeight: 1.6 }}>
                {role === 'admin' ? 'Cargando panel de administrador...' : 'Redirigiendo a tu perfil de vendedor...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={c.page}>
      <div style={c.container}>
        <LogoArea />
        <div style={c.card}>

          {/* Role toggle */}
          <div style={c.roleToggle}>
            <button style={c.roleBtn(role === 'alumno')} onClick={() => { setRole('alumno'); setError('') }}>
              Alumno
            </button>
            <button style={c.roleBtn(role === 'admin')} onClick={() => { setRole('admin'); setError('') }}>
              Administrador
            </button>
          </div>

          {/* Errors / success messages */}
          {error && <div style={c.errGlobal}>{error}</div>}
          {resetSent && (
            <div style={{ ...c.errGlobal, color: '#1D9E75', background: '#EDFAF5', border: '1px solid #5DCAA5' }}>
              ¡Enlace enviado! Revisa tu correo y spam.
            </div>
          )}

          {role === 'admin' && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={c.adminBadge}>🔐 Acceso Administrador</span>
            </div>
          )}

          <p style={c.sectionTitle}>Iniciar sesión</p>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={c.label}>
              {role === 'admin' ? 'Correo institucional' : 'Código de estudiante o Correo'}
            </label>
            <input
              style={c.input}
              type="email"
              placeholder={role === 'admin' ? 'admin@cucei.udg.mx' : 'usuario@alumnos.udg.mx'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={c.label}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...c.input, paddingRight: 42 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button style={c.pwToggle} onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
            <button style={c.forgotBtn} onClick={handleForgotPassword}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            style={{ ...c.btnPrimary, background: role === 'admin' ? '#185FA5' : '#378ADD', opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>

          {role === 'alumno' && (
            <>
              <div style={c.divider}>o</div>
              <button style={c.btnSecondary} onClick={() => navigate('/register')}>
                Crear nueva cuenta
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export function LogoArea() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{ width: 62, height: 62, background: '#B5D4F4', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
          <rect x="4" y="8" width="18" height="16" rx="3" fill="#185FA5"/>
          <rect x="10" y="4" width="18" height="16" rx="3" fill="#85B7EB"/>
          <rect x="12" y="14" width="6" height="8" rx="1.5" fill="#fff"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0C447C', letterSpacing: '-0.3px', margin: 0 }}>
        Cucei Market
      </h1>
      <p style={{ fontSize: 13, color: '#378ADD', marginTop: 3 }}>
        Marketplace universitario CUCEI · UdG
      </p>
    </div>
  )
}

export const c = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    background: '#EAF4FB',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  container: { width: '100%', maxWidth: 440 },
  card: {
    background: '#fff', borderRadius: 20, padding: '2rem',
    border: '1px solid #DAEDF9', boxShadow: '0 4px 20px rgba(12,68,124,0.05)',
  },
  roleToggle: {
    display: 'flex', background: '#EAF4FB', borderRadius: 10, padding: 4, marginBottom: '1.5rem',
  },
  roleBtn: (active) => ({
    flex: 1, padding: 8, fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 7,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? '#fff' : 'transparent',
    color: active ? '#0C447C' : '#378ADD',
    boxShadow: active ? '0 1px 4px rgba(55,138,221,0.15)' : 'none',
  }),
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#0C447C', marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#378ADD', marginBottom: 5, letterSpacing: '0.3px' },
  input: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #B5D4F4', borderRadius: 10,
    fontSize: 14, color: '#0C447C', background: '#F5FAFF', outline: 'none',
    fontFamily: "'Segoe UI', sans-serif", boxSizing: 'border-box',
  },
  pwToggle: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#85B7EB',
    display: 'flex', alignItems: 'center',
  },
  forgotBtn: { background: 'none', border: 'none', color: '#378ADD', fontSize: 12, cursor: 'pointer' },
  btnPrimary: {
    width: '100%', padding: 12, color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.2px',
    marginTop: '0.25rem', fontFamily: "'Segoe UI', sans-serif",
  },
  btnSecondary: {
    width: '100%', padding: 11, background: '#EAF4FB', color: '#185FA5',
    border: '1.5px solid #B5D4F4', borderRadius: 10, fontSize: 14,
    fontWeight: 500, cursor: 'pointer', fontFamily: "'Segoe UI', sans-serif",
  },
  divider: { textAlign: 'center', color: '#85B7EB', fontSize: 12, margin: '1.25rem 0' },
  errGlobal: {
    fontSize: 13, color: '#E24B4A', background: '#FCEBEB',
    padding: '8px 12px', borderRadius: 8, marginBottom: '1rem', textAlign: 'center',
  },
  adminBadge: {
    display: 'inline-block', background: '#EAF4FB', color: '#185FA5',
    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #B5D4F4',
  },
  successAvatar: {
    width: 64, height: 64, background: '#EAF4FB', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem', fontSize: 32,
  },
}
