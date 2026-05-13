import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { vendorService } from '../services/api'

const STATUS_MAP = {
  pending:  { label: 'En revisión',  className: 'badge-pending'  },
  approved: { label: 'Aprobada',     className: 'badge-approved' },
  rejected: { label: 'Rechazada',    className: 'badge-rejected' },
}

// Placeholder requests for when the backend isn't up yet
const MOCK_REQUESTS = [
  { id: 1, storeName: 'Mi tienda',  category: 'Comida y bebidas', status: 'pending',  createdAt: new Date().toISOString() },
]

export default function Profile() {
  const navigate  = useNavigate()
  const user      = auth.currentUser
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  const memberSince = user
    ? new Date(user.metadata.creationTime).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  useEffect(() => {
    vendorService.getMyRequests()
      .then(setRequests)
      .catch(() => {
        // Backend not up yet — show mock data so the UI is still useful
        setRequests(MOCK_REQUESTS)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">

      {/* ── Profile card ── */}
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">Mi Perfil</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 12,
            background: '#c7d2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, flexShrink: 0,
          }}>
            🧑‍🎓
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-blue)' }}>
              {user?.email?.split('@')[0]?.toUpperCase()}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Miembro desde: <strong>{memberSince}</strong>
            </p>
          </div>
        </div>

        <hr className="divider" />

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Estatus</p>
            <span className="badge badge-pending">En proceso</span>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Verificaciones</p>
            <strong style={{ color: 'var(--primary-blue)' }}>1 de 3 (Correo ✓)</strong>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Confianza</p>
            <strong style={{ color: 'var(--primary-blue)', fontSize: 20 }}>33%</strong>
          </div>
        </div>

        <br />
        <button
          className="btn-primary"
          style={{ maxWidth: 240 }}
          onClick={() => navigate('/add-store')}
        >
          + Agregar Tienda
        </button>
      </div>

      {/* ── My Requests ── */}
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">Mis Solicitudes</div>

        {loading ? (
          <div className="spinner" />
        ) : requests.length === 0 ? (
          <div className="alert alert-info">
            Aún no tienes solicitudes. ¡Registra tu primera tienda!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Tienda</th>
                  <th style={{ padding: '8px 12px' }}>Categoría</th>
                  <th style={{ padding: '8px 12px' }}>Fecha</th>
                  <th style={{ padding: '8px 12px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const status = STATUS_MAP[req.status] || STATUS_MAP.pending
                  const date   = new Date(req.createdAt).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{req.storeName}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{req.category}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{date}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge ${status.className}`}>{status.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
