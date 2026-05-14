import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorService } from '../services/api'
import './AddStore.css'

const CATEGORIES = [
  'Comida y bebidas', 'Papelería y útiles', 'Ropa y accesorios',
  'Tecnología', 'Servicios (impresiones, copias, etc.)', 'Libros y apuntes', 'Otro',
]

const LOCATIONS = [
  'Edificio A', 'Edificio B', 'Edificio C', 'Edificio D', 'Edificio E',
  'Explanada principal', 'Cafetería central', 'Zona de lockers', 'Otro',
]

export default function AddStore() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    storeName: '', category: '', location: '', description: '', whatsapp: '', instagram: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.storeName || !form.category || !form.location || !form.description)
      return setError('Por favor llena todos los campos obligatorios (*).')
    if (form.description.length < 20)
      return setError('La descripción debe tener al menos 20 caracteres.')

    setLoading(true)
    try {
      await vendorService.createStore(form)
      setSuccess(true)
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('Network'))
        setError('El servidor aún no está disponible. Intenta más tarde.')
      else
        setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="addstore-page">
        <div className="addstore-container">
          <div className="addstore-card">
            <div className="success-wrap">
              <div className="success-avatar">🎉</div>
              <h3>¡Tienda registrada!</h3>
              <p>Tu tienda <strong>"{form.storeName}"</strong> fue enviada para revisión.<br />Puedes ver el estado en tu perfil.</p>
              <button className="btn-primary" onClick={() => navigate('/profile')}>Ver mi perfil</button>
              <button className="btn-secondary" onClick={() => { setSuccess(false); setForm({ storeName:'', category:'', location:'', description:'', whatsapp:'', instagram:'' }) }}>
                Agregar otra tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="addstore-page">
      <div className="addstore-container">
        <div className="addstore-card">
          <h2 className="addstore-title">Registrar mi tienda</h2>

          {error && <div className="alert-error">{error}</div>}

          <div className="field">
            <label>Nombre de la tienda *</label>
            <input type="text" placeholder="Ej. Tacos El Profe" maxLength={60}
              value={form.storeName} onChange={set('storeName')} />
          </div>

          <div className="field">
            <label>Categoría *</label>
            <select value={form.category} onChange={set('category')}>
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Ubicación en campus *</label>
            <select value={form.location} onChange={set('location')}>
              <option value="">¿Dónde vendes?</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Descripción *</label>
            <textarea
              placeholder="Describe qué vendes, horarios, precios aproximados..."
              maxLength={300}
              value={form.description}
              onChange={set('description')}
            />
            <div className="field-count">{form.description.length}/300</div>
          </div>

          <div className="field">
            <label>WhatsApp (opcional)</label>
            <input type="text" placeholder="Ej. 3312345678"
              value={form.whatsapp} onChange={set('whatsapp')} />
          </div>

          <div className="field">
            <label>Instagram (opcional)</label>
            <input type="text" placeholder="Ej. @mitienducita"
              value={form.instagram} onChange={set('instagram')} />
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enviando...' : 'Registrar Tienda'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
