// ============================================================
// src/pages/Admin/Reports.jsx
// Vista gráfica de métricas globales e incidentes.
// Fusionado: UI original + Mock Data para Recharts
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import './Reports.css';

const COLORS = { accent: '#3b82f6', green: '#22c55e', yellow: '#f59e0b', red: '#ef4444', muted: '#4a7fc1', gray: '#94a3b8' };
const PIE_COLORS = [COLORS.green, COLORS.yellow, COLORS.red, COLORS.gray];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <p className="tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || COLORS.accent }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('6m');

  // Datos simulados
  const [kpis, setKpis] = useState({ totalUsers: 0, totalStores: 0, totalProducts: 0, totalReviews: 0, avgRating: '—', pendingCount: 0 });
  const [registrationsData, setRegistrationsData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topStoresData, setTopStoresData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Simulamos el retraso de una llamada al backend
    setTimeout(() => {
      setKpis({ totalUsers: 145, totalStores: 32, totalProducts: 210, totalReviews: 450, avgRating: '4.7', pendingCount: 5 });
      
      setRegistrationsData([
        { mes: 'Ene', vendedores: 10, compradores: 30 },
        { mes: 'Feb', vendedores: 5, compradores: 25 },
        { mes: 'Mar', vendedores: 15, compradores: 40 },
      ]);

      setStatusData([
        { name: 'Aprobados', value: 25 },
        { name: 'Pendientes', value: 5 },
        { name: 'Rechazados', value: 2 },
      ]);

      setTopStoresData([
        { name: 'Tacos El Inge', rating: 4.9 },
        { name: 'Jugos CUCEI', rating: 4.8 },
        { name: 'Papas Alpha', rating: 4.6 },
      ]);

      setActivityData([
        { mes: 'Ene', aprobaciones: 8, rechazos: 1, suspensiones: 0 },
        { mes: 'Feb', aprobaciones: 4, rechazos: 2, suspensiones: 1 },
      ]);

      setIncidents([
        { date: new Date().toISOString(), type: 'aprobacion', label: '✅ Aprobación', desc: 'Juan Pérez fue aprobado como vendedor.' },
        { date: new Date(Date.now() - 86400000).toISOString(), type: 'rechazo', label: '❌ Rechazo', desc: 'Solicitud rechazada. Motivo: Kardex borroso.' }
      ]);

      setLoading(false);
    }, 800);
  }, [period]);

  const formatDateLong = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="page-loading">Generando reportes (Simulado)…</div>;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <Link to="/admin" className="back-link">← Panel Admin</Link>
          <h1>Reportes y Métricas</h1>
          <p>Visión general de la actividad de CUCEI Market</p>
        </div>
        <div className="period-selector">
          {[{ id: '3m', label: 'Últimos 3 meses' }, { id: '6m', label: 'Últimos 6 meses' }].map(p => (
            <button key={p.id} className={`period-btn ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><span className="kpi-icon">👥</span><span className="kpi-value">{kpis.totalUsers}</span><span className="kpi-label">Usuarios</span></div>
        <div className="kpi-card"><span className="kpi-icon">🏪</span><span className="kpi-value">{kpis.totalStores}</span><span className="kpi-label">Puestos</span></div>
        <div className="kpi-card"><span className="kpi-icon">📦</span><span className="kpi-value">{kpis.totalProducts}</span><span className="kpi-label">Productos</span></div>
        <div className="kpi-card"><span className="kpi-icon">⭐</span><span className="kpi-value">{kpis.avgRating}</span><span className="kpi-label">Rating promedio</span></div>
        <div className="kpi-card highlight-yellow"><span className="kpi-icon">⏳</span><span className="kpi-value">{kpis.pendingCount}</span><span className="kpi-label">Pendientes</span></div>
      </div>

      <div className="charts-row">
        <div className="chart-card wide">
          <h2 className="chart-title">Nuevos registros</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={registrationsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: COLORS.gray, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COLORS.gray, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.07)' }} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: COLORS.gray }} iconType="circle" iconSize={8} />
              <Bar dataKey="vendedores" fill={COLORS.accent} radius={[4,4,0,0]} name="Vendedores" />
              <Bar dataKey="compradores" fill={COLORS.muted} radius={[4,4,0,0]} name="Compradores" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Estado de vendedores</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {statusData.map((entry, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="incidents-section">
        <div className="incidents-header">
          <h2>Historial de acciones administrativas</h2>
          <span className="incidents-count">{incidents.length} registros</span>
        </div>
        <div className="incidents-table-wrap">
          <table className="incidents-table">
            <thead><tr><th>Fecha y hora</th><th>Tipo</th><th>Descripción</th></tr></thead>
            <tbody>
              {incidents.map((inc, i) => (
                <tr key={i} className={`incident-row ${inc.type}`}>
                  <td className="incident-date">{formatDateLong(inc.date)}</td>
                  <td><span className={`incident-badge ${inc.type}`}>{inc.label}</span></td>
                  <td className="incident-desc">{inc.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}