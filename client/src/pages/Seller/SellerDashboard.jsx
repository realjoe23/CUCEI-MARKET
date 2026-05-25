// ============================================================
// src/pages/Seller/SellerDashboard.jsx
// Panel principal del Estudiante Vendedor.
// Fusionado: UI original + Datos del AuthContext (Node/Supabase)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SellerDashboard.css';

const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente de aprobación', color: 'yellow', icon: '⏳' },
  aprobado:   { label: 'Cuenta aprobada',         color: 'green',  icon: '✅' },
  rechazado:  { label: 'Solicitud rechazada',       color: 'red',    icon: '❌' },
  suspendido: { label: 'Cuenta suspendida',         color: 'gray',   icon: '🚫' },
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [store, setStore]     = useState(null);
  const [stats, setStats]     = useState({ products: 0, reviews: 0, rating: 0 });
  const [loading, setLoading] = useState(false);

  // Leemos los datos tal como nos los mandó nuestro servidor Node.js al hacer login
  const status      = user?.estado || 'pendiente';
  const statusConf  = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  const displayName = user?.nombre_completo || user?.correo_institucional;
  const rejectionReason = user?.razon_rechazo;

  useEffect(() => {
    // Aquí en el futuro haremos un fetch a http://localhost:3001/api/stores/me
    // para buscar si el usuario ya registró su puesto físico en el campus.
    // Por ahora, lo dejamos vacío para que no marque errores.
  }, [user]);

  if (loading) return <div className="page-loading">Cargando panel…</div>;

  return (
    <div className="seller-page">

      {/* Encabezado */}
      <div className="dash-header">
        <div className="dash-header-text">
          <h1>Mi Panel</h1>
          <p>Bienvenido, <strong>{displayName}</strong></p>
        </div>
        <span className={`status-pill ${statusConf.color}`}>
          {statusConf.icon} {statusConf.label}
        </span>
      </div>

      {/* Banner: pendiente */}
      {status === 'pendiente' && (
        <div className="info-banner yellow">
          <div className="banner-content">
            <h3>⏳ Solicitud en revisión</h3>
            <p>Tu solicitud está siendo revisada por el administrador. Recibirás una notificación cuando sea procesada.</p>
            <p>Mientras tanto, puedes registrar la información de tu puesto físico.</p>
          </div>
          <Link to="/seller/add-store" className="banner-btn">Registrar mi puesto →</Link>
        </div>
      )}

      {/* Banner: rechazado */}
      {status === 'rechazado' && (
        <div className="info-banner red">
          <div className="banner-content">
            <h3>❌ Solicitud rechazada</h3>
            <p>Tu solicitud fue rechazada por el administrador.</p>
            {rejectionReason && (
              <p><strong>Motivo:</strong> {rejectionReason}</p>
            )}
            <p>Actualiza tu información o vuelve a subir tu Kardex e intenta de nuevo.</p>
          </div>
          <Link to="/seller/edit-profile" className="banner-btn">Actualizar información →</Link>
        </div>
      )}

      {/* Banner: suspendido */}
      {status === 'suspendido' && (
        <div className="info-banner gray">
          <div className="banner-content">
            <h3>🚫 Cuenta suspendida</h3>
            <p>Tu cuenta ha sido suspendida. Contacta al administrador para más información.</p>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="quick-actions-grid">
        <Link to="/seller/add-store" className="action-card">
          <span className="action-icon">🏪</span>
          <div><h3>Registrar puesto</h3><p>Da de alta tu local en el campus</p></div>
        </Link>
        
        {/* El botón de productos se bloquea si la cuenta no está aprobada */}
        <Link
          to="/seller/manage-products"
          className={`action-card ${status !== 'aprobado' ? 'disabled' : ''}`}
          onClick={status !== 'aprobado' ? (e) => e.preventDefault() : undefined}
          title={status !== 'aprobado' ? 'Disponible al ser aprobado' : ''}
        >
          <span className="action-icon">📦</span>
          <div><h3>Mis productos</h3><p>Gestiona tu menú o catálogo</p></div>
        </Link>

        <Link to="/seller/edit-profile" className="action-card">
          <span className="action-icon">✏️</span>
          <div><h3>Editar perfil</h3><p>Actualiza tu información y contraseña</p></div>
        </Link>
      </div>

      {/* Snapshot del puesto (Se mostrará cuando conectemos la tabla stores) */}
      {store && (
        <div className="seller-card store-snapshot">
          <div className="snapshot-top">
            <div>
              <h2>{store.name}</h2>
              <p className="snapshot-location">📍 {store.location}</p>
            </div>
            <span className={`store-status-dot ${store.status}`}>
              {store.status === 'activo' ? '● Activo' : '● Inactivo'}
            </span>
          </div>
          <div className="snapshot-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.products}</span>
              <span className="stat-label">Productos</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{stats.reviews}</span>
              <span className="stat-label">Reseñas</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{stats.reviews > 0 ? `⭐ ${stats.rating}` : '—'}</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}