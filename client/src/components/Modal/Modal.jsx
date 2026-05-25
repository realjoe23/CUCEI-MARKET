// ============================================================
// src/components/Modal/Modal.jsx
//
// Ventana emergente reutilizable.
// Uso principal: justificación de rechazo en AdminDashboard (RF03),
// confirmaciones de eliminación en ManageProducts.
//
// Props:
//   isOpen       {boolean}  — controla visibilidad
//   onClose      {func}     — callback al cerrar
//   title        {string}   — título del modal
//   children               — contenido interno (formulario, texto, etc.)
//   onConfirm    {func}     — callback del botón de confirmar (opcional)
//   confirmLabel {string}   — texto del botón confirmar (default: "Confirmar")
//   confirmDanger{boolean}  — aplica estilo rojo al botón confirmar
// ============================================================

import React, { useEffect } from 'react';
import './Modal.css';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = 'Confirmar',
  confirmDanger = false,
}) {
  // Bloquear scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar al presionar Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro
      >
        {/* Encabezado */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-body">{children}</div>

        {/* Footer con acciones (solo si se pasa onConfirm) */}
        {onConfirm && (
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              className={`modal-btn-confirm ${confirmDanger ? 'danger' : ''}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
