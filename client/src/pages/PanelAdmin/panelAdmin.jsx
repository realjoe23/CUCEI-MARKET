import React from 'react';
import './panelAdmin.css';

const PanelAdmin = () => {
  // Datos simulados para probar la UI
  const solicitudes = [
    { id: 1, nombre: 'Ricardo Arévalo', codigo: '220418788', fecha: '15/04/2026', estado: 'Pendiente' },
    { id: 2, nombre: 'Sofia Torres', codigo: '223501455', fecha: '14/04/2026', estado: 'Aprobado' },
    { id: 3, nombre: 'Andrés Méndez', codigo: '219782001', fecha: '13/04/2026', estado: 'Rechazado' }
  ];

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="header-brand">
          <h1>CUCEI Market</h1>
          <span className="badge">ADMINISTRADOR</span>
        </div>
        <button className="btn-logout">Salir</button>
      </header>

      <main className="admin-content">
        <div className="metrics-dashboard">
          <div className="metric-card">
            <h3>4</h3>
            <p>Total Solicitudes</p>
          </div>
          <div className="metric-card">
            <h3 className="text-warning">2</h3>
            <p>Pendientes</p>
          </div>
          <div className="metric-card">
            <h3 className="text-success">1</h3>
            <p>Aprobados</p>
          </div>
          <div className="metric-card">
            <h3 className="text-danger">1</h3>
            <p>Rechazados</p>
          </div>
        </div>

        <div className="tabs-container">
          <button className="tab active">Solicitudes de vendedores</button>
          <button className="tab">Puestos en campus</button>
        </div>

        <div className="requests-list">
          <p className="helper-text">Revisa el kardex certificado de cada solicitud antes de aprobar o rechazar al vendedor.</p>
          
          {solicitudes.map((solicitud) => (
            <div className="request-item" key={solicitud.id}>
              <div className="request-info">
                <div className="avatar">{solicitud.nombre.charAt(0)}</div>
                <div>
                  <h4>{solicitud.nombre}</h4>
                  <p>{solicitud.codigo} - Solicitud: {solicitud.fecha}</p>
                </div>
              </div>
              
              <div className="request-actions">
                <span className={`status-badge ${solicitud.estado.toLowerCase()}`}>
                  {solicitud.estado}
                </span>
                <button className="btn-view-pdf">Ver Kardex PDF</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PanelAdmin;