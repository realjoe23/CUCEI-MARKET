import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { vendorService } from '../services/api'
import './Profile.css'

const STATUS_MAP = {
  pending:  { label: 'En revisión', className: 'badge-pending'  },
  approved: { label: 'Aprobada',    className: 'badge-approved' },
  rejected: { label: 'Rechazada',   className: 'badge-rejected' },
}

const MOCK_REQUESTS = [
  { id: 1, storeName: 'Mi tienda', category: 'Comida y bebidas', status: 'pending', createdAt: new Date().toISOString() },
]

export default function Profile() {
  const navigate = useNavigate()
  const user     = auth.currentUser
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)

  const memberSince = user
    ? new Date(user.metadata.creationTime).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  useEffect(() => {
    vendorService.getMyRequests()
      .then(setRequests)
      .catch(() => setRequests(MOCK_REQUESTS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── Profile card ── */}
        <div className="profile-card">
          <h2 className="card-title">Mi Perfil</h2>

          <div className="profile-header">
            <div className="profile-avatar">🧑‍🎓</div>
            <div>
              <p className="profile-name">{user?.email?.split('@')[0]?.toUpperCase()}</p>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-since">Miembro desde: <strong>{memberSince}</strong></p>
            </div>
          </div>

          <hr className="divider" />

          <div className="profile-stats">
            <div className="stat-item">
              <p className="stat-label">Estatus</p>
              <span className="badge badge-pending">En proceso</span>
            </div>
            <div className="stat-item">
              <p className="stat-label">Verificaciones</p>
              <strong style={{ color: 'var(--blue-dark)' }}>1 de 3 (Correo ✓)</strong>
            </div>
            <div className="stat-item">
              <p className="stat-label">Confianza</p>
              <p className="stat-value">33%</p>
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate('/add-store')}>
            + Agregar Tienda
          </button>
        </div>

        {/* ── My Requests card ── */}
        <div className="profile-card">
          <h2 className="card-title">Mis Solicitudes</h2>

          {loading ? (
            <div className="spinner" />
          ) : requests.length === 0 ? (
            <div className="alert-info">
              Aún no tienes solicitudes. ¡Registra tu primera tienda!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Tienda</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => {
                    const status = STATUS_MAP[req.status] || STATUS_MAP.pending
                    const date   = new Date(req.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
                    return (
                      <tr key={req.id}>
                        <td>{req.storeName}</td>
                        <td>{req.category}</td>
                        <td>{date}</td>
                        <td><span className={`badge ${status.className}`}>{status.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
