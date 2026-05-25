// ============================================================
// src/components/StoreCard/StoreCard.jsx
//
// Tarjeta de un puesto de venta.
// Usada en: Home (catálogo) y SellerDashboard (mis puestos).
//
// Props:
//   store {object} — datos del puesto desde Firestore:
//     id          {string}
//     name        {string}
//     category    {string}
//     location    {string}
//     schedule    {string}
//     imageUrl    {string}
//     rating      {number}  0–5
//     reviewCount {number}
//     status      {string}  'activo' | 'inactivo'
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreCard.css';

export default function StoreCard({ store }) {
  const navigate = useNavigate();
  const {
    id,
    name,
    category,
    location,
    schedule,
    imageUrl,
    rating = 0,
    reviewCount = 0,
    status,
  } = store;

  // Genera las estrellas visuales a partir del rating numérico
  const filledStars = Math.round(rating);
  const stars = '★'.repeat(filledStars) + '☆'.repeat(5 - filledStars);

  return (
    <div
      className="store-card"
      onClick={() => navigate(`/store/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/store/${id}`)}
      aria-label={`Ver detalles de ${name}`}
    >
      {/* Imagen o placeholder */}
      <div className="store-card-img">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="store-img-placeholder">🏪</div>
        )}

        {/* Badge de disponibilidad */}
        {status === 'activo' && (
          <span className="store-badge-open">Abierto</span>
        )}
        {status === 'inactivo' && (
          <span className="store-badge-closed">Cerrado</span>
        )}
      </div>

      {/* Info del puesto */}
      <div className="store-card-body">
        <span className="store-category">{category}</span>
        <h3 className="store-name">{name}</h3>

        {location && (
          <p className="store-detail">
            <span className="detail-icon">📍</span>
            {location}
          </p>
        )}

        {schedule && (
          <p className="store-detail">
            <span className="detail-icon">🕐</span>
            {schedule}
          </p>
        )}

        {/* Rating */}
        <div className="store-rating">
          <span className="rating-stars">{stars}</span>
          <span className="rating-count">
            {rating > 0 ? rating.toFixed(1) : '—'} ({reviewCount})
          </span>
        </div>
      </div>
    </div>
  );
}
