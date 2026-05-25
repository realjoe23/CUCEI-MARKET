
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Verificar si hay sesión al cargar la página
  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem('cucei_market_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        setUser(parsed.user);
        setUserRole(parsed.role);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // 2. Método de Registro conectado a tu Node.js (Supabase)
  const register = async (formDataToSend) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        body: formDataToSend, // Aquí enviamos el FormData que incluye el archivo
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Error al registrar');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  // 3. Método de Login (Lo implementaremos pronto en Node)
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Credenciales incorrectas');
      }

      // Guardar sesión
      setUser(result.user);
      setUserRole(result.user.rol);
      localStorage.setItem(
        'cucei_market_session',
        JSON.stringify({ isAuthenticated: true, user: result.user, role: result.user.rol })
      );

      return result;
    } catch (error) {
      throw error;
    }
  };

  // 4. Método para Cerrar Sesión
  const logout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('cucei_market_session');
  };

  const value = { user, userRole, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};