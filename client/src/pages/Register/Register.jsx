import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { LogoArea } from './Login'
import './Register.css'

const CARRERAS = [
  'Ingeniería en Computación', 'Ingeniería en Informática', 'Ingeniería Civil',
  'Ingeniería Química', 'Ingeniería Industrial', 'Ingeniería Eléctrica',
  'Ingeniería Electrónica', 'Ingeniería Mecánica', 'Matemáticas', 'Física', 'Otra',
]

const SEMESTRES = ['1°','2°','3°','4°','5°','6°','7°','8°','9°','10°+']

const STRENGTH_COLORS = ['#F09595','#EF9F27','#5DCAA5','#1D9E75']
const STRENGTH_LABELS = ['Débil','Regular','Buena','Muy segura']

function getStrength(pw) {
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

function StepBar({ current }) {
  const steps = ['Datos', 'Acceso', 'Confirmar']
  return (
    <div className="step-bar">
      {steps.map((label, i) => {
        const n       = i + 1
        const done    = n < current
        const active  = n === current
        const pending = n > current
        return (
          <div key={n} className="step">
            <div className={`step-dot ${done ? 'done' : active ? 'active' : 'pending'}`}>
              {done
                ? <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                : n}
            </div>
            <span className={`step-label ${pending ? 'pending' : ''}`}>{label}</span>
            {n < steps.length && <div className={`step-line ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1
  const [nombre,   setNombre]   = useState('')
  const [codigo,   setCodigo]   = useState('')
  const [semestre, setSemestre] = useState('')
  const [carrera,  setCarrera]  = useState('')

  // Step 2
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [pw2,     setPw2]     = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [terms,   setTerms]   = useState(false)

  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const strength = getStrength(pw)

  const goStep2 = () => {
    setError('')
    if (!nombre.trim()) return setError('Ingresa tu nombre completo.')
    if (codigo.length !== 9 || isNaN(codigo)) return setError('El código debe tener exactamente 9 dígitos.')
    setStep(2)
  }

  const goStep3 = () => {
    setError('')
    const trimmed = email.toLowerCase().trim()
    if (!trimmed.endsWith('@alumnos.udg.mx') && !trimmed.endsWith('@cucei.udg.mx'))
      return setError('Solo se permiten correos institucionales (@alumnos.udg.mx).')
    if (pw.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (pw !== pw2)    return setError('Las contraseñas no coinciden.')
    setStep(3)
  }

  const handleRegister = async () => {
    setError('')
    if (!terms) return setError('Debes aceptar los términos y condiciones.')

    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), pw)
      await sendEmailVerification(credential.user)
      await signOut(auth)
      setDone(true)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use')
        setError('Este correo ya está registrado. ¿Quieres iniciar sesión?')
      else
        setError('Ocurrió un error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="register-page">
        <div className="register-container">
          <LogoArea />
          <div className="register-card">
            <div className="success-wrap">
              <div className="success-avatar">📬</div>
              <h3>¡Cuenta creada, {nombre.split(' ')[0]}!</h3>
              <p>Tu cuenta fue registrada exitosamente.<br />Te enviamos un correo de verificación a:</p>
              <div className="email-tag">{email}</div>
              <p className="success-note">
                Haz clic en el enlace del correo para activar tu cuenta.<br />
                Revisa también tu carpeta de spam.
              </p>
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <LogoArea />
        <div className="register-card">
          <StepBar current={step} />
          {error && <div className="alert-error">{error}</div>}

          {/* ── Step 1: Personal info ── */}
          {step === 1 && (
            <>
              <p className="section-title">Datos personales</p>

              <div className="field">
                <label>Nombre completo</label>
                <input type="text" placeholder="Ej. Ana García López"
                  value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>

              <div className="field">
                <label>Código de estudiante (9 dígitos)</label>
                <input type="text" placeholder="Ej. 220419709" maxLength={9}
                  value={codigo} onChange={e => setCodigo(e.target.value)}
                  className={codigo.length > 0 ? (codigo.length === 9 && !isNaN(codigo) ? 'ok' : 'error') : ''} />
              </div>

              <div className="field-row">
                <div className="field" style={{ margin: 0 }}>
                  <label>Semestre</label>
                  <select value={semestre} onChange={e => setSemestre(e.target.value)}>
                    <option value="">Semestre</option>
                    {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Carrera</label>
                  <select value={carrera} onChange={e => setCarrera(e.target.value)}>
                    <option value="">Carrera</option>
                    {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={goStep2}>Continuar</button>
              <button className="btn-secondary" onClick={() => navigate('/login')}>Ya tengo cuenta</button>
            </>
          )}

          {/* ── Step 2: Email & password ── */}
          {step === 2 && (
            <>
              <button className="btn-back" onClick={() => { setStep(1); setError('') }}>← Volver</button>
              <p className="section-title">Acceso a la cuenta</p>

              <div className="field">
                <label>Correo institucional *</label>
                <input type="email" placeholder="usuario@alumnos.udg.mx"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <span className="field-note">* Se enviará un enlace real de verificación a este correo.</span>
              </div>

              <div className="field">
                <label>Contraseña (mín. 8 caracteres)</label>
                <div className="pw-wrap">
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={pw} onChange={e => setPw(e.target.value)} />
                  <button className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {pw.length > 0 && (
                  <>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${strength * 25}%`, background: STRENGTH_COLORS[strength - 1] }} />
                    </div>
                    <span className="strength-label" style={{ color: STRENGTH_COLORS[strength - 1] }}>
                      {STRENGTH_LABELS[strength - 1]}
                    </span>
                  </>
                )}
              </div>

              <div className="field">
                <label>Confirmar contraseña</label>
                <div className="pw-wrap">
                  <input type={showPw2 ? 'text' : 'password'} placeholder="••••••••"
                    value={pw2} onChange={e => setPw2(e.target.value)} />
                  <button className="pw-toggle" onClick={() => setShowPw2(p => !p)}>
                    {showPw2 ? '🙈' : '👁️'}
                  </button>
                </div>
                {pw2.length > 0 && (
                  pw === pw2
                    ? <span className="match-ok">✓ Las contraseñas coinciden</span>
                    : <span className="match-error">Las contraseñas no coinciden</span>
                )}
              </div>

              <button className="btn-primary" onClick={goStep3}>Continuar</button>
            </>
          )}

          {/* ── Step 3: Summary & confirm ── */}
          {step === 3 && (
            <>
              <button className="btn-back" onClick={() => { setStep(2); setError('') }}>← Volver</button>
              <p className="section-title">Confirma tus datos</p>

              <div style={{ marginBottom: '1.25rem' }}>
                {[['Nombre', nombre], ['Código', codigo], ['Semestre', semestre || '—'], ['Carrera', carrera || '—'], ['Correo', email]].map(([k, v]) => (
                  <div key={k} className="summary-row">
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>

              <div className="terms-row">
                <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} />
                <label htmlFor="terms">
                  Acepto los <a href="#">términos y condiciones</a> y el <a href="#">aviso de privacidad</a> de CUCEI Market.
                </label>
              </div>

              <button className="btn-primary" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
