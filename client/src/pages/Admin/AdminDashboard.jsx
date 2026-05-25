// ============================================================
// src/pages/Admin/AdminDashboard.jsx
// Panel de control para el Administrador de CUCEI Market.
// Fusionado: UI original + Fetch a Node.js/Supabase
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import './AdminDashboard.css';

// ── Configuración visual de estados ──────────────────────────
const STATUS_CFG = {
  pendiente:  { label: 'Pendiente',  color: 'yellow', icon: '⏳' },
  aprobado:   { label: 'Aprobado',   color: 'green',  icon: '✅' },
  rechazado:  { label: 'Rechazado',  color: 'red',    icon: '❌' },
  suspendido: { label: 'Suspendido', color: 'gray',   icon: '🚫' },
};

// ── Tabs del panel ────────────────────────────────────────────
const TABS = [
  { id: 'pending',  label: 'Solicitudes',  icon: '📋' },
  { id: 'stores',   label: 'Puestos',      icon: '🏪' },
  { id: 'sellers',  label: 'Vendedores',   icon: '👤' },
  { id: 'buyers',   label: 'Compradores',  icon: '👥' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  // ── Estado general ─────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('pending');
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading,setActionLoading]= useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [stores,       setStores]       = useState([]);
  const [stats,        setStats]        = useState({
    pending: 0, approved: 0, rejected: 0, suspended: 0, buyers: 0,
  });

  // ── Modales ───────────────────────────────────────────────
  const [rejectModal,    setRejectModal]    = useState(false);
  const [targetUser,     setTargetUser]     = useState(null);
  const [rejectReason,   setRejectReason]   = useState('');
  const [rejectError,    setRejectError]    = useState('');
  
  const [suspendModal,   setSuspendModal]   = useState(false);
  const [suspendReason,  setSuspendReason]  = useState('');
  
  const [kardexModal,    setKardexModal]    = useState(false);
  const [kardexUser,     setKardexUser]     = useState(null);

  // ── Toast interno ─────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Cargar usuarios desde tu servidor Node.js ─────────────
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/users');
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      const data = await response.json();
      const mappedUsers = data.map((u) => ({
        id: u.id_usuario,
        displayName: u.nombre_completo,
        email: u.correo_institucional,
        studentId: u.codigo_estudiante,
        role: u.rol,
        status: u.estado || 'pendiente',
        kardexUrl: u.kardex_url,
        createdAt: u.created_at
      }));
      setUsers(mappedUsers);
      setStats({
        pending:   mappedUsers.filter(u => u.role === 'vendedor' && u.status === 'pendiente').length,
        approved:  mappedUsers.filter(u => u.role === 'vendedor' && u.status === 'aprobado').length,
        rejected:  mappedUsers.filter(u => u.role === 'vendedor' && u.status === 'rechazado').length,
        suspended: mappedUsers.filter(u => u.status === 'suspendido').length,
        buyers:    mappedUsers.filter(u => u.role === 'comprador').length,
      });
    } catch (err) {
      console.error(err);
      showToast('Error cargando usuarios: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/stores');
      const data = await res.json();
      setStores(data.map(s => ({
        id:          s.id_puesto,
        name:        s.nombre,
        category:    s.categoria,
        location:    s.ubicacion,
        estado:      s.estado,
        vendedor:    s.usuarios?.nombre_completo || '—',
        correo:      s.usuarios?.correo_institucional || '—',
      })));
    } catch (err) {
      showToast('Error cargando puestos: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  // ── Función genérica para cambiar el estado en Node.js ────
  const updateStatusInDb = async (userId, newStatus, reason = null) => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error en el servidor');
      }

      showToast(`Usuario marcado como ${newStatus} ✅`);
      fetchUsers(); // Recargamos la tabla para ver los cambios
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filtrado por tab y búsqueda ───────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'pending') return u.role === 'vendedor' && u.status === 'pendiente' && matchesSearch;
    if (activeTab === 'sellers') return u.role === 'vendedor' && u.status !== 'pendiente' && matchesSearch;
    if (activeTab === 'buyers') return u.role === 'comprador' && matchesSearch;

    return matchesSearch;
  });

  // ── Acciones Específicas ──────────────────────────────────
  const handleApprove = (userId) => updateStatusInDb(userId, 'aprobado');

  const openRejectModal = (u) => { setTargetUser(u); setRejectReason(''); setRejectError(''); setRejectModal(true); };
  const handleRejectConfirm = () => {
    if (rejectReason.length < 20) return setRejectError('La justificación debe tener al menos 20 caracteres.');
    updateStatusInDb(targetUser.id, 'rechazado', rejectReason).then(() => setRejectModal(false));
  };

  const openSuspendModal = (u) => { setTargetUser(u); setSuspendReason(''); setSuspendModal(true); };
  const handleSuspendConfirm = () => {
    updateStatusInDb(targetUser.id, 'suspendido', suspendReason).then(() => setSuspendModal(false));
  };

  const handleReactivate = (userId) => updateStatusInDb(userId, 'aprobado');

  const updateStoreStatus = async (storeId, nuevoEstado) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/admin/stores/${storeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al actualizar puesto');
      showToast(`Puesto marcado como ${nuevoEstado} ✅`);
      fetchStores();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openKardexModal = (u) => { setKardexUser(u); setKardexModal(true); };

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── Render de tarjeta (solicitud pendiente) ───────────────
  const renderPendingCard = (u) => (
    <div key={u.id} className="admin-user-card pending-card">
      <div className="user-card-header">
        <div className="user-avatar">{(u.displayName || u.email || '?')[0].toUpperCase()}</div>
        <div className="user-card-info">
          <h3 className="user-name">{u.displayName || 'Sin nombre'}</h3>
          <p className="user-email">{u.email}</p>
          {u.studentId && <p className="user-meta"><span className="meta-badge">🎓 Código: {u.studentId}</span></p>}
          <p className="user-meta"><span className="meta-badge">📅 Registrado: {formatDate(u.createdAt)}</span></p>
        </div>
        <span className={`status-pill ${STATUS_CFG['pendiente'].color}`}>{STATUS_CFG['pendiente'].icon} {STATUS_CFG['pendiente'].label}</span>
      </div>

      <div className="kardex-section">
        {u.kardexUrl ? (
          <div className="kardex-available">
            <span className="kardex-icon">📄</span>
            <div className="kardex-info">
              <span className="kardex-label">Kardex adjunto</span>
              <span className="kardex-hint">Verificar antes de aprobar</span>
            </div>
            <button className="btn-view-kardex" onClick={() => openKardexModal(u)}>Ver Kardex</button>
          </div>
        ) : (
          <div className="kardex-missing"><span>⚠️</span><span>Kardex no adjuntado</span></div>
        )}
      </div>

      <div className="user-card-actions">
        <button className="btn-action approve" onClick={() => handleApprove(u.id)} disabled={actionLoading}>✅ Aprobar</button>
        <button className="btn-action reject" onClick={() => openRejectModal(u)} disabled={actionLoading}>❌ Rechazar</button>
      </div>
    </div>
  );

  // ── Render de fila de tabla ───────────────────────────────
  const renderUserRow = (u) => {
    const cfg = STATUS_CFG[u.status] || STATUS_CFG['pendiente'];
    const isSuspended = u.status === 'suspendido';

    return (
      <tr key={u.id} className={`user-row ${isSuspended ? 'suspended' : ''}`}>
        <td>
          <div className="table-user-cell">
            <div className="user-avatar small">{(u.displayName || u.email || '?')[0].toUpperCase()}</div>
            <div>
              <p className="table-user-name">{u.displayName}</p>
              <p className="table-user-email">{u.email}</p>
            </div>
          </div>
        </td>
        {activeTab === 'sellers' && <td><span className="meta-text">{u.studentId || '—'}</span></td>}
        <td>{formatDate(u.createdAt)}</td>
        {activeTab === 'sellers' && (
          <>
            <td><span className={`status-pill ${cfg.color}`}>{cfg.icon} {cfg.label}</span></td>
            <td>
              {u.kardexUrl ? (
                <button className="btn-link" onClick={() => openKardexModal(u)}>📄 Ver PDF</button>
              ) : (
                <span className="meta-text muted">No adjuntado</span>
              )}
            </td>
          </>
        )}
        <td>
          <div className="table-actions">
            {isSuspended ? (
              <button className="btn-table reactivate" onClick={() => handleReactivate(u.id)} disabled={actionLoading}>↩ Reactivar</button>
            ) : (
              <button className="btn-table suspend" onClick={() => openSuspendModal(u)} disabled={actionLoading}>🚫 Suspender</button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // ── Render principal ──────────────────────────────────────
  if (loading) return <div className="page-loading">Conectando con Servidor NEXOCODE…</div>;

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <div>
          <h1>Panel Administrativo</h1>
          <p>Control de solicitudes, usuarios y métricas de CUCEI Market</p>
        </div>
        <Link to="/admin/reports" className="btn-reports">📊 Ver Reportes</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow" onClick={() => setActiveTab('pending')}><div className="stat-card-icon">⏳</div><div><p className="stat-card-value">{stats.pending}</p><p className="stat-card-label">Pendientes</p></div></div>
        <div className="stat-card green" onClick={() => setActiveTab('sellers')}><div className="stat-card-icon">✅</div><div><p className="stat-card-value">{stats.approved}</p><p className="stat-card-label">Aprobados</p></div></div>
        <div className="stat-card red"><div className="stat-card-icon">❌</div><div><p className="stat-card-value">{stats.rejected}</p><p className="stat-card-label">Rechazados</p></div></div>
        <div className="stat-card gray"><div className="stat-card-icon">🚫</div><div><p className="stat-card-value">{stats.suspended}</p><p className="stat-card-label">Suspendidos</p></div></div>
        <div className="stat-card blue" onClick={() => setActiveTab('buyers')}><div className="stat-card-icon">👥</div><div><p className="stat-card-value">{stats.buyers}</p><p className="stat-card-label">Compradores</p></div></div>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button key={tab.id} className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}>
            {tab.icon} {tab.label} {tab.id === 'pending' && stats.pending > 0 && <span className="tab-badge">{stats.pending}</span>}
          </button>
        ))}
      </div>

      <div className="admin-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Buscar por nombre, correo o código…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
        {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>}
      </div>

      {activeTab === 'pending' && (
        <div className="pending-list">
          {filteredUsers.length === 0 ? <div className="empty-state"><h3>Sin solicitudes pendientes</h3></div> : filteredUsers.map(renderPendingCard)}
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="admin-table-wrap">
          {stores.length === 0 ? <div className="empty-state"><h3>No hay puestos registrados</h3></div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Vendedor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stores
                  .filter(s =>
                    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.vendedor?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(s => {
                    const STORE_CFG = {
                      activo:   { label: 'Activo',   color: 'green',  icon: '✅' },
                      inactivo: { label: 'Inactivo', color: 'yellow', icon: '⏳' },
                      rechazado:{ label: 'Rechazado',color: 'red',    icon: '❌' },
                    };
                    const cfg = STORE_CFG[s.estado] || STORE_CFG['inactivo'];
                    return (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.category}</td>
                        <td>{s.location}</td>
                        <td>
                          <p style={{margin:0}}>{s.vendedor}</p>
                          <p style={{margin:0, fontSize:'0.78rem', color:'var(--gray-400)'}}>{s.correo}</p>
                        </td>
                        <td><span className={`status-pill ${cfg.color}`}>{cfg.icon} {cfg.label}</span></td>
                        <td>
                          <div className="table-actions">
                            {s.estado !== 'activo' && (
                              <button className="btn-table approve" onClick={() => updateStoreStatus(s.id, 'activo')} disabled={actionLoading}>✅ Aprobar</button>
                            )}
                            {s.estado === 'activo' && (
                              <button className="btn-table suspend" onClick={() => updateStoreStatus(s.id, 'inactivo')} disabled={actionLoading}>🚫 Desactivar</button>
                            )}
                            {s.estado !== 'rechazado' && (
                              <button className="btn-table reject" onClick={() => updateStoreStatus(s.id, 'rechazado')} disabled={actionLoading}>❌ Rechazar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(activeTab === 'sellers' || activeTab === 'buyers') && (
        <div className="admin-table-wrap">
          {filteredUsers.length === 0 ? <div className="empty-state"><h3>No se encontraron usuarios</h3></div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>{activeTab === 'sellers' && <th>Código</th>}<th>Registrado</th>
                  {activeTab === 'sellers' && (<><th>Estado</th><th>Kardex</th></>)}<th>Acciones</th>
                </tr>
              </thead>
              <tbody>{filteredUsers.map(renderUserRow)}</tbody>
            </table>
          )}
        </div>
      )}

      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Rechazar solicitud" onConfirm={handleRejectConfirm} confirmLabel="Rechazar" confirmDanger>
        <div className="reject-modal-body">
          <textarea className="reject-textarea" placeholder="Motivo del rechazo..." value={rejectReason} onChange={(e) => {setRejectReason(e.target.value); setRejectError('');}} rows={5}></textarea>
          {rejectError && <p className="reject-error" style={{color: 'red', marginTop: '5px'}}>{rejectError}</p>}
        </div>
      </Modal>

      <Modal isOpen={suspendModal} onClose={() => setSuspendModal(false)} title="Suspender usuario" onConfirm={handleSuspendConfirm} confirmLabel="Suspender" confirmDanger>
        <div className="reject-modal-body">
          <textarea className="reject-textarea" placeholder="Motivo (opcional)..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} rows={3}></textarea>
        </div>
      </Modal>

      <Modal isOpen={kardexModal} onClose={() => setKardexModal(false)} title="Visor de Kardex">
        <div className="kardex-viewer">
          {kardexUser?.kardexUrl ? (
            <iframe src={kardexUser.kardexUrl} title="Kardex PDF" style={{width: '100%', height: '500px', border: 'none'}} />
          ) : <p>No hay documento adjunto.</p>}
        </div>
      </Modal>
    </div>
  );
}