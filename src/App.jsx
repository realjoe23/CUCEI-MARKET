import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Login    from './pages/Login'
import Register from './pages/Register'
import AddStore from './pages/AddStore'
import Profile  from './pages/Profile'

function AppLayout() {
  const [user, setUser] = useState(undefined)
  const location = useLocation()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return unsub
  }, [])

  const hideHeader = ['/login', '/register'].includes(location.pathname)

  return (
    <>
      {!hideHeader && <Header user={user} />}
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-store" element={
          <ProtectedRoute><AddStore /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        {/* Default: go to profile (ProtectedRoute will redirect to login if needed) */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
