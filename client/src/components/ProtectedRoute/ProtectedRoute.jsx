

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();

  // 1. Mientras el contexto está leyendo el localStorage, detenemos el render
  // para evitar que el guardián rebote al usuario por error al presionar F5
  if (loading) {
    return (
      <div className="page-loading" style={{ textAlign: 'center', marginTop: '50px' }}>
        Verificando permisos de acceso...
      </div>
    );
  }

  // Fallback a localStorage por si el estado global necesita doble verificación
  const session = JSON.parse(
    localStorage.getItem('cucei_market_session') || 'null'
  );

  const isAuthenticated = user || (session && session.isAuthenticated);
  const role            = userRole || session?.role;

  // 2. Sin sesión activa → redirigir de inmediato al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Sesión activa pero el rol no está autorizado → redirigir al catálogo (Home)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Todo correcto → renderizar la página solicitada (Dashboard, catálogo, etc.)
  return children;
}