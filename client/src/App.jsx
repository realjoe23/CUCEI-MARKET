
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexto global de autenticación
import { AuthProvider } from './context/AuthContext';

// Componentes globales
import Navbar         from './components/Navbar/Navbar';
import ToastNotify    from './components/ToastNotify/ToastNotify';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Páginas públicas
import Home         from './pages/Home/Home';
import StoreDetails from './pages/StoreDetails/StoreDetails';
import Login        from './pages/Auth/Login';
import Register     from './pages/Auth/Register';

// Páginas del Vendedor
import SellerDashboard from './pages/Seller/SellerDashboard';
import AddStore        from './pages/Seller/AddStore';
import EditProfile     from './pages/Seller/EditProfile';
import ManageProducts  from './pages/Seller/ManageProducts';

// Páginas del Administrador
import AdminDashboard from './pages/Admin/AdminDashboard';
import Reports        from './pages/Admin/Reports';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ToastNotify />

        <main className="main-content">
          <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/store/:id" element={<StoreDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* RUTAS PROTEGIDAS — VENDEDOR */}
            <Route path="/seller" element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/add-store" element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <AddStore />
              </ProtectedRoute>
            } />
            <Route path="/seller/edit-profile" element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/seller/manage-products" element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <ManageProducts />
              </ProtectedRoute>
            } />

            {/* RUTAS PROTEGIDAS — ADMINISTRADOR */}
            <Route path="/admin" element={
              // Aceptamos ambos términos por si en BD dice "admin"
              <ProtectedRoute allowedRoles={['administrador', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['administrador', 'admin']}>
                <Reports />
              </ProtectedRoute>
            } />

            {/* FALLBACK — Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}