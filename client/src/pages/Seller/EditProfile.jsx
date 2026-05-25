// ============================================================
// src/pages/Seller/EditProfile.jsx
// Edición de datos personales del vendedor y cambio de contraseña.
// Fusionado: UI original + Preparación para API Node.js
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Seller.css';
// import './EditProfile.css'; // Asegúrate de tener este CSS si ella lo creó

export default function EditProfile() {
  // Ahora solo leemos 'user' de nuestro nuevo contexto
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Perfil ────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    displayName: user?.nombre_completo || '',
    phone:       user?.telefono || '',
    bio:         user?.bio || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]         = useState({ type: '', text: '' });

  // ── Contraseña ────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg]         = useState({ type: '', text: '' });
  const [showPw, setShowPw]       = useState({ current: false, next: false, confirm: false });

  // ── Handlers ──────────────────────────────────────────────
  const handleProfile = (k) => (e) => setProfile(p => ({ ...p, [k]: e.target.value }));
  const handlePw      = (k) => (e) => setPwForm(p  => ({ ...p, [k]: e.target.value }));
  const toggleShow    = (k) => ()   => setShowPw(p  => ({ ...p, [k]: !p[k] }));

  // ── Guardar perfil ────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    if (!profile.displayName.trim()) {
      setProfileMsg({ type: 'error', text: 'El nombre no puede estar vacío.' });
      return;
    }
    setProfileLoading(true);
    try {
      // TODO: Aquí haremos el fetch a tu servidor Node.js
      /*
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!response.ok) throw new Error('Error en el servidor');
      */
      
      // Simulamos éxito temporalmente para que no marque error Vite
      setTimeout(() => {
        setProfileMsg({ type: 'success', text: '✅ Perfil actualizado correctamente (Simulado).' });
        setProfileLoading(false);
      }, 1000);

    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' });
      setProfileLoading(false);
    } 
  };

  // ── Cambiar contraseña ────────────────────────────────────
  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (pwForm.next.length < 6) {
      setPwMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setPwLoading(true);
    try {
      // TODO: Aquí haremos el fetch a tu servidor para actualizar el Hash en Supabase
      
      setTimeout(() => {
        setPwMsg({ type: 'success', text: '✅ Contraseña actualizada (Simulado).' });
        setPwForm({ current: '', next: '', confirm: '' });
        setPwLoading(false);
      }, 1000);

    } catch (err) {
      setPwMsg({ type: 'error', text: 'Error al cambiar la contraseña.' });
      setPwLoading(false);
    }
  };

  return (
    <div className="seller-page" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Editar perfil</h1>
          <p>Actualiza tu información de vendedor</p>
        </div>
      </div>

      {/* ── Sección: Datos personales ──────────────────────── */}
      <div className="seller-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Datos personales</h2>
        <form className="seller-form" onSubmit={saveProfile} noValidate>

          <div className="input-group">
            <label htmlFor="ep-name">Nombre completo</label>
            <input id="ep-name" type="text" placeholder="Tu nombre"
              value={profile.displayName} onChange={handleProfile('displayName')} />
          </div>

          <div className="input-group">
            <label htmlFor="ep-phone">Teléfono de contacto</label>
            <input id="ep-phone" type="tel" placeholder="33 XXXX XXXX"
              value={profile.phone} onChange={handleProfile('phone')} />
          </div>

          <div className="input-group">
            <label htmlFor="ep-bio">Descripción breve</label>
            <textarea id="ep-bio" rows={3}
              placeholder="Cuéntanos sobre ti o tu puesto…"
              value={profile.bio} onChange={handleProfile('bio')} />
          </div>

          {profileMsg.text && (
            <p className={profileMsg.type === 'error' ? 'msg-error' : 'msg-success'}
              role="alert">{profileMsg.text}</p>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/seller')}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Sección: Cambiar contraseña ────────────────────── */}
      <div className="seller-card">
        <h2 className="section-title">Cambiar contraseña</h2>
        <form className="seller-form" onSubmit={savePassword} noValidate>

          {[
            { key: 'current', label: 'Contraseña actual',        placeholder: '••••••••' },
            { key: 'next',    label: 'Nueva contraseña',         placeholder: 'Mínimo 6 caracteres' },
            { key: 'confirm', label: 'Confirmar nueva contraseña', placeholder: 'Repite la nueva contraseña' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="input-group">
              <label htmlFor={`pw-${key}`}>{label}</label>
              <div className="pw-wrap">
                <input
                  id={`pw-${key}`}
                  type={showPw[key] ? 'text' : 'password'}
                  placeholder={placeholder}
                  value={pwForm[key]}
                  onChange={handlePw(key)}
                  autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                  required
                />
                <button type="button" className="pw-toggle" onClick={toggleShow(key)}
                  aria-label={showPw[key] ? 'Ocultar' : 'Mostrar'}>
                  {showPw[key] ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          ))}

          {pwMsg.text && (
            <p className={pwMsg.type === 'error' ? 'msg-error' : 'msg-success'}
              role="alert">{pwMsg.text}</p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}