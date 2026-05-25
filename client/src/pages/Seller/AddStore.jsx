// ============================================================
// src/pages/Seller/AddStore.jsx
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import './Seller.css';
import './AddStore.css';

const CATEGORIES = ['Comida', 'Bebidas', 'Papelería', 'Electrónica', 'Ropa', 'Servicios', 'Otro'];

export default function AddStore() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', category: '', location: '', schedule: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!form.name.trim() || !form.category || !form.location.trim()) {
      setError('Nombre, categoría y ubicación son obligatorios.');
      return;
    }

    // Validación de usuario logueado
    if (!user?.id_usuario) {
      setError('Debes haber iniciado sesión para registrar un puesto.');
      return;
    }

    setLoading(true);

    try {
      // Enviamos los datos como un objeto JSON puro
      const storeData = {
        nombre: form.name,
        categoria: form.category,
        ubicacion: form.location,
        horario: form.schedule,
        descripcion: form.description,
        vendedor_id: parseInt(user.id_usuario) // Aseguramos que sea número
      };

      const response = await fetch(`${API_URL}/api/stores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(storeData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar el puesto');
      }

      alert("¡Puesto registrado exitosamente!");
      navigate('/seller');

    } catch (err) {
      console.error("Error en frontend:", err);
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-page">
      <div className="page-header">
        <h1>Registrar puesto</h1>
        <p>Completa la información de tu local en el campus</p>
      </div>

      <div className="seller-card">
        <form className="seller-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="store-name">Nombre del puesto *</label>
              <input id="store-name" type="text" placeholder="Ej. Tacos El CUCEI"
                value={form.name} onChange={handle('name')} required />
            </div>
            <div className="input-group">
              <label htmlFor="store-category">Categoría *</label>
              <select id="store-category" value={form.category} onChange={handle('category')} required>
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="store-location">Ubicación en el campus *</label>
            <input id="store-location" type="text" placeholder="Ej. Frente al edificio C"
              value={form.location} onChange={handle('location')} required />
          </div>

          <div className="input-group">
            <label htmlFor="store-schedule">Horario de atención</label>
            <input id="store-schedule" type="text" placeholder="Ej. Lunes a viernes 8:00 – 16:00 hrs"
              value={form.schedule} onChange={handle('schedule')} />
          </div>

          <div className="input-group">
            <label htmlFor="store-desc">Descripción del puesto</label>
            <textarea id="store-desc" rows={3}
              placeholder="Describe qué vendes…"
              value={form.description} onChange={handle('description')} />
          </div>

          {error && <p className="msg-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/seller')}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar puesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}