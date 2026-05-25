// ============================================================
// src/components/ProductCard/ProductCard.jsx
//
// Tarjeta de un artículo (tacos, refresco, papelería, etc.)
// Usada en: StoreDetails (modo solo lectura) y
//           ManageProducts (modo editable con acciones CRUD).
//
// Props:
//   product  {object}  — datos del producto desde Firestore:
//     id          {string}
//     name        {string}
//     price       {number}
//     description {string}
//     imageUrl    {string}
//     available   {boolean}
//   editable {boolean} — muestra botones Editar / Eliminar
//   onEdit   {func}    — callback al editar   (recibe el producto)
//   onDelete {func}    — callback al eliminar (recibe el producto)
// ============================================================

import React from 'react';
import './ProductCard.css';

export default function ProductCard({
  product,
  editable = false,
  onEdit,
  onDelete,
}) {
  const {
    name,
    price,
    description,
    imageUrl,
    available = true,
  } = product;

  return (
    <div className={`product-card ${!available ? 'unavailable' : ''}`}>

      {/* ── Imagen ─────────────────────────────────────────── */}
      <div className="product-img">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="product-img-placeholder">🍽️</div>
        )}

        {/* Overlay de no disponible */}
        {!available && (
          <div className="product-unavailable-overlay">
            No disponible
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────── */}
      <div className="product-body">
        <h4 className="product-name">{name}</h4>

        {description && (
          <p className="product-description">{description}</p>
        )}

        <div className="product-footer">
          {/* Precio */}
          <span className="product-price">
            ${Number(price).toFixed(2)}
          </span>

          {/* Acciones CRUD (solo en modo editable) */}
          {editable && (
            <div className="product-actions">
              <button
                className="btn-edit-product"
                onClick={() => onEdit(product)}
                aria-label={`Editar ${name}`}
              >
                Editar
              </button>
              <button
                className="btn-delete-product"
                onClick={() => onDelete(product)}
                aria-label={`Eliminar ${name}`}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
