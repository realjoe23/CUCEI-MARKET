// ============================================================
// src/components/Navbar/Navbar.jsx
//
// Barra de navegación persistente.
// Se adapta dinámicamente según el rol del usuario.
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    closeMenu();
  };

  // Marca el link activo comparando la ruta actual
  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  // Variable de apoyo para detectar si es admin (por si en BD se llama "admin" o "administrador")
  const isAdmin = userRole === 'admin' || userRole === 'administrador';

  return (
    <nav className="navbar">

      {/* ── Logo / Brand ─────────────────────────────────── */}
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="brand-icon">🏪</span>
        <span className="brand-text">
          CUCEI <strong>Market</strong>
        </span>
      </Link>

      {/* ── Links (desktop + mobile) ──────────────────────── */}
      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>

        <Link
          to="/"
          className={isActive('/') ? 'active' : ''}
          onClick={closeMenu}
        >
          Inicio
        </Link>

        {/* Sin sesión */}
        {!user && (
          <>
            <Link
              to="/login"
              className={isActive('/login') ? 'active' : ''}
              onClick={closeMenu}
            >
              Ingresar
            </Link>
            <Link
              to="/register"
              className={`nav-btn-register ${isActive('/register') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Registrarse
            </Link>
          </>
        )}

        {/* Vendedor */}
        {user && userRole === 'vendedor' && (
          <>
            <Link
              to="/seller"
              className={isActive('/seller') && !isActive('/seller/') ? 'active' : location.pathname === '/seller' ? 'active' : ''}
              onClick={closeMenu}
            >
              Mi Panel
            </Link>
            <Link
              to="/seller/manage-products"
              className={isActive('/seller/manage-products') ? 'active' : ''}
              onClick={closeMenu}
            >
              Productos
            </Link>
            <Link
              to="/seller/edit-profile"
              className={isActive('/seller/edit-profile') ? 'active' : ''}
              onClick={closeMenu}
            >
              Perfil
            </Link>
          </>
        )}

        {/* Administrador */}
        {user && isAdmin && (
          <>
            <Link
              to="/admin"
              className={location.pathname === '/admin' ? 'active' : ''}
              onClick={closeMenu}
            >
              Panel Admin
            </Link>
            <Link
              to="/admin/reports"
              className={isActive('/admin/reports') ? 'active' : ''}
              onClick={closeMenu}
            >
              Reportes
            </Link>
          </>
        )}

        {/* Botón salir (siempre que haya sesión) */}
        {user && (
          <button className="nav-btn-logout" onClick={handleLogout}>
            Salir
          </button>
        )}
      </div>

      {/* ── Botón hamburguesa (móvil) ─────────────────────── */}
      <button
        className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Abrir menú"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}