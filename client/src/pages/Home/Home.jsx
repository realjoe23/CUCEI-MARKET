// ============================================================
// src/pages/Home/Home.jsx
// Catálogo público de puestos — CUCEI Market
// Fusionado: UI original + Desconexión de Firebase + Mock Data
// ============================================================

import React, { useState, useEffect } from 'react';
import StoreCard from '../../components/StoreCard/StoreCard';
import './Home.css';

export default function Home() {
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    const cargarPuestos = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/stores');
        const data = await res.json();
        setStores(data.map(s => ({
          id:       s.id_puesto,
          name:     s.nombre,
          category: s.categoria,
          location: s.ubicacion,
          schedule: s.horario,
          status:   s.estado,
        })));
      } catch (err) {
        console.error('Error cargando puestos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarPuestos();
  }, []);

  const filtered = stores.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Cargando catálogo de puestos…</div>;

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>CUCEI Market</h1>
        <p>Descubre los puestos de comida y productos de tu campus 🎓</p>
        <div className="home-search-wrap">
          <span className="home-search-icon">🔍</span>
          <input
            className="home-search"
            type="text"
            placeholder="Buscar por nombre, categoría o ubicación…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="home-empty">
          <span>🏪</span>
          <p>No se encontraron puestos activos con esa búsqueda.</p>
        </div>
      ) : (
        <div className="stores-grid">
          {filtered.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}