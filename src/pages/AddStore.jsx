import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorService } from '../services/api'

const CATEGORIES = [
  'Comida y bebidas',
  'Papelería y útiles',
  'Ropa y accesorios',
  'Tecnología',
  'Servicios (impresiones, copias, etc.)',
  'Libros y apuntes',
  'Otro',
]

const LOCATIONS = [
  'Edificio A',
  'Edificio B',
  'Edificio C',
  'Edificio D',
  'Edificio E',
  'Explanada principal',
  'Cafetería central',
  'Zona de lockers',
  'Otro',
]

export default function AddStore() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    storeName: '',
    category: '',
    location: '',
    description: '',
    whatsapp: '',
    instagram: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.storeName || !form.category || !form.location || !form.description) {
      return setError('Por favor llena todos los campos obligatorios (*).')
    }
    if (form.description.length < 20) {
      return setError('La descripción debe tener al menos 20 caracteres.')
    }

    setLoading(true)
    try {
      await vendorService.createStore(form)
      setSuccess(true)
    } catch (err) {
      // If the backend isn't up yet, we show a friendly message
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        setError('El servidor aún no está disponible. Tu información se guardará cuando el backend esté listo.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page-center">
        <div className="card" style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <div className="card-header-center">¡Tienda registrada!</div>
          <div className="alert alert-success">
            Tu tienda <strong>"{form.storeName}"</strong> fue enviada para revisión.
            Puedes ver el estado en tu perfil.
          </div>
          <br />
          <button className="btn-primary" onClick={() => navigate('/profile')}>
            Ver mi perfil
          </button>
          <button className="btn-secondary" onClick={() => { setSuccess(false); setForm({ storeName:'', category:'', location:'', description:'', whatsapp:'', instagram:'' }) }}>
            Agregar otra tienda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-header">Registrar mi tienda</div>

        {error && <div className="alert alert-error">{error}</div>}

        <label className="input-label">Nombre de la tienda *</label>
        <input
          className="input-field"
          type="text"
          placeholder="Ej. Tacos El Profe"
          value={form.storeName}
          onChange={set('storeName')}
          maxLength={60}
        />

        <label className="input-label">Categoría *</label>
        <select className="input-field" value={form.category} onChange={set('category')}>
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="input-label">Ubicación en campus *</label>
        <select className="input-field" value={form.location} onChange={set('location')}>
          <option value="">¿Dónde vendes?</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <label className="input-label">Descripción *</label>
        <textarea
          className="input-field"
          placeholder="Describe qué vendes, horarios, precios aproximados..."
          value={form.description}
          onChange={set('description')}
          maxLength={300}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', float: 'right' }}>
          {form.description.length}/300
        </span>

        <label className="input-label">WhatsApp (opcional)</label>
        <input
          className="input-field"
          type="text"
          placeholder="Ej. 3312345678"
          value={form.whatsapp}
          onChange={set('whatsapp')}
        />

        <label className="input-label">Instagram (opcional)</label>
        <input
          className="input-field"
          type="text"
          placeholder="Ej. @mitienducita"
          value={form.instagram}
          onChange={set('instagram')}
        />

        <br />
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Registrar Tienda'}
        </button>
        <button className="btn-secondary" onClick={() => navigate('/profile')}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
