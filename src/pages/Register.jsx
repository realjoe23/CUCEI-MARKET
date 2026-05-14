import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { LogoArea, c } from './Login'

const CARRERAS = [
  'Ingeniería en Computación', 'Ingeniería en Informática', 'Ingeniería Civil',
  'Ingeniería Química', 'Ingeniería Industrial', 'Ingeniería Eléctrica',
  'Ingeniería Electrónica', 'Ingeniería Mecánica', 'Matemáticas', 'Física', 'Otra',
]

const SEMESTRES = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°+']

function StepBar({ current }) {
  const steps = ['Datos', 'Acceso', 'Confirmar']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.75rem' }}>
      {steps.map((label, i) => {
        const n = i + 1
        const done    = n < current
        const active  = n === current
        const pending = n > current
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: n < steps.length ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                flexShrink: 0, transition: 'all 0.3s',
                background: done ? '#378ADD' : active ? '#B5D4F4' : '#EAF4FB',
                color: done ? '#fff' : active ? '#0C447C' : '#85B7EB',
                border: active ? '2px solid #378ADD' : pending ? '2px solid #DAEDF9' : 'none',
              }}>
                {done
                  ? <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  : n
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: pending ? '#85B7EB' : '#378ADD' }}>
                {label}
              </span>
            </div>
            {n < steps.length && (
              <div style={{ flex: 1, height: 1.5, background: done ? '#378ADD' : '#DAEDF9', borderRadius: 2 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1 fields
  const [nombre,   setNombre]   = useState('')
  const [codigo,   setCodigo]   = useState('')
  const [semestre, setSemestre] = useState('')
  const [carrera,  setCarrera]  = useState('')

  // Step 2 fields
  const [email,    setEmail]    = useState('')
  const [pw,       setPw]       = useState('')
  const [pw2,      setPw2]      = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [showPw2,  setShowPw2]  = useState(false)
  const [terms,    setTerms]    = useState(false)

  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  // Password strength
  const getStrength = (p) => {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strengthColors = ['#F09595', '#EF9F27', '#5DCAA5', '#1D9E75']
  const strengthLabels = ['Débil', 'Regular', 'Buena', 'Muy segura']
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
    if (!trimmed.endsWith('@alumnos.udg.mx') && !trimmed.endsWith('@cucei.udg.mx')) {
      return setError('Solo se permiten correos institucionales (@alumnos.udg.mx).')
    }
    if (pw.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (pw !== pw2) return setError('Las contraseñas no coinciden.')
    setStep(3)
  }

  const handleRegister = async () => {
    setError('')
    if (!terms) return setError('Debes aceptar los términos y condiciones.')

    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), pw)

      // Send real verification email
      await sendEmailVerification(credential.user)

      // Sign out immediately — they must verify first
      await signOut(auth)

      setDone(true)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. ¿Quieres iniciar sesión?')
      } else {
        setError('Ocurrió un error: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen after registration ──
  if (done) {
    return (
      <div style={c.page}>
        <div style={c.container}>
          <LogoArea />
          <div style={c.card}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={c.successAvatar}>📬</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0C447C', marginBottom: 6 }}>
                ¡Cuenta creada, {nombre.split(' ')[0]}!
              </h3>
              <p style={{ fontSize: 13, color: '#378ADD', lineHeight: 1.6 }}>
                Tu cuenta ha sido registrada exitosamente.<br />
                Te enviamos un correo de verificación a:
              </p>
              <div style={{ margin: '10px 0', display: 'inline-block', background: '#EAF4FB', color: '#185FA5', fontSize: 13, fontWeight: 500, padding: '4px 14px', borderRadius: 20, border: '1px solid #B5D4F4' }}>
                {email}
              </div>
              <p style={{ fontSize: 12, color: '#85B7EB', marginBottom: '1.5rem' }}>
                Haz clic en el enlace del correo para activar tu cuenta. Revisa también tu carpeta de spam.
              </p>
              <button style={{ ...c.btnPrimary, background: '#378ADD' }} onClick={() => navigate('/login')}>
                Ir a Iniciar Sesión
              </button>
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
          <StepBar current={step} />

          {error && <div style={c.errGlobal}>{error}</div>}

          {/* ── Step 1: Personal info ── */}
          {step === 1 && (
            <>
              <p style={c.sectionTitle}>Datos personales</p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={c.label}>Nombre completo</label>
                <input style={c.input} type="text" placeholder="Ej. Ana García López"
                  value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={c.label}>Código de estudiante (9 dígitos)</label>
                <input style={c.input} type="text" placeholder="Ej. 220419709" maxLength={9}
                  value={codigo} onChange={e => setCodigo(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
                <div>
                  <label style={c.label}>Semestre</label>
                  <select style={c.input} value={semestre} onChange={e => setSemestre(e.target.value)}>
                    <option value="">Semestre</option>
                    {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={c.label}>Carrera</label>
                  <select style={c.input} value={carrera} onChange={e => setCarrera(e.target.value)}>
                    <option value="">Carrera</option>
                    {CARRERAS.map(car => <option key={car} value={car}>{car}</option>)}
                  </select>
                </div>
              </div>

              <button style={{ ...c.btnPrimary, background: '#378ADD' }} onClick={goStep2}>
                Continuar
              </button>
              <button style={{ ...c.btnSecondary, marginTop: 10 }} onClick={() => navigate('/login')}>
                Ya tengo cuenta
              </button>
            </>
          )}

          {/* ── Step 2: Email & password ── */}
          {step === 2 && (
            <>
              <button style={{ background: 'none', border: 'none', color: '#378ADD', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: '1.25rem', fontWeight: 500 }}
                onClick={() => { setStep(1); setError('') }}>
                ← Volver
              </button>

              <p style={c.sectionTitle}>Acceso a la cuenta</p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={c.label}>Correo institucional *</label>
                <input style={c.input} type="email" placeholder="usuario@alumnos.udg.mx"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <span style={{ fontSize: 11, color: 'red' }}>
                  * Se enviará un enlace real de verificación a este correo.
                </span>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={c.label}>Contraseña (mín. 8 caracteres)</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...c.input, paddingRight: 42 }} type={showPw ? 'text' : 'password'}
                    placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} />
                  <button style={c.pwToggle} onClick={() => setShowPw(p => !p)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {pw.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 4, borderRadius: 2, background: '#EAF4FB', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 2, transition: 'width 0.3s, background 0.3s', width: `${strength * 25}%`, background: strengthColors[strength - 1] || strengthColors[0] }} />
                    </div>
                    <span style={{ fontSize: 11, color: strengthColors[strength - 1] || strengthColors[0] }}>
                      {strengthLabels[strength - 1] || strengthLabels[0]}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={c.label}>Confirmar contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...c.input, paddingRight: 42 }} type={showPw2 ? 'text' : 'password'}
                    placeholder="••••••••" value={pw2} onChange={e => setPw2(e.target.value)} />
                  <button style={c.pwToggle} onClick={() => setShowPw2(p => !p)}>
                    {showPw2 ? '🙈' : '👁️'}
                  </button>
                </div>
                {pw2.length > 0 && pw !== pw2 && (
                  <span style={{ fontSize: 11, color: '#E24B4A' }}>Las contraseñas no coinciden</span>
                )}
                {pw2.length > 0 && pw === pw2 && (
                  <span style={{ fontSize: 11, color: '#1D9E75' }}>✓ Las contraseñas coinciden</span>
                )}
              </div>

              <button style={{ ...c.btnPrimary, background: '#378ADD' }} onClick={goStep3}>
                Continuar
              </button>
            </>
          )}

          {/* ── Step 3: Summary & confirm ── */}
          {step === 3 && (
            <>
              <button style={{ background: 'none', border: 'none', color: '#378ADD', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: '1.25rem', fontWeight: 500 }}
                onClick={() => { setStep(2); setError('') }}>
                ← Volver
              </button>

              <p style={c.sectionTitle}>Confirma tus datos</p>

              <div style={{ marginBottom: '1.25rem' }}>
                {[['Nombre', nombre], ['Código', codigo], ['Semestre', semestre || '—'], ['Carrera', carrera || '—'], ['Correo', email]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #DAEDF9', fontSize: 13 }}>
                    <span style={{ color: '#85B7EB' }}>{k}</span>
                    <span style={{ color: '#0C447C', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '1.25rem 0 1.5rem' }}>
                <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#378ADD', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }} />
                <label htmlFor="terms" style={{ fontSize: 12, color: '#378ADD', lineHeight: 1.5, cursor: 'pointer' }}>
                  Acepto los <a href="#" style={{ color: '#185FA5', fontWeight: 500 }}>términos y condiciones</a> y el <a href="#" style={{ color: '#185FA5', fontWeight: 500 }}>aviso de privacidad</a> de CUCEI Market.
                </label>
              </div>

              <button style={{ ...c.btnPrimary, background: '#378ADD', opacity: loading ? 0.7 : 1 }}
                onClick={handleRegister} disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
