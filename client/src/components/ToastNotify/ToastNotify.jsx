// ============================================================
// src/components/ToastNotify/ToastNotify.jsx
//
// Sistema de alertas flotantes (éxito, error, info).
// Incluye su propio Context para poder disparar toasts
// desde cualquier componente de la app.
//
// Configuración en App.jsx:
//   Reemplaza <ToastNotify /> por <ToastProvider> y
//   coloca <ToastContainer /> dentro del árbol.
//   (Ver instrucciones al final del archivo)
//
// Uso en cualquier componente:
//   const { showToast } = useToast();
//   showToast('Guardado correctamente', 'success');
//   showToast('Error al conectar', 'error');
//   showToast('Recuerda subir tu Kardex', 'info');
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import './ToastNotify.css';

/* ── Contexto ────────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ── Hook de consumo ─────────────────────────────────────── */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
};

/* ── Íconos por tipo ─────────────────────────────────────── */
const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'i',
};

/* ── Provider: envuelve toda la app ─────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Muestra una alerta flotante.
   * @param {string} message  — Texto del toast
   * @param {'success'|'error'|'info'} type — Tipo visual
   * @param {number} duration — Duración en ms (default 3500)
   */
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Contenedor de toasts — siempre al final del árbol */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <span className={`toast-icon icon-${toast.type}`}>
              {ICONS[toast.type] || 'i'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Componente placeholder ──────────────────────────────────
   App.jsx importa este componente como <ToastNotify />.
   Si prefieres usar el Provider directamente, reemplaza en App.jsx:
     - Importa { ToastProvider } from './components/ToastNotify/ToastNotify'
     - Envuelve <Router> con <ToastProvider>
     - Elimina la línea <ToastNotify />
   ─────────────────────────────────────────────────────────── */
export default function ToastNotify() {
  return null;
}
