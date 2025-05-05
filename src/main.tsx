import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ValidarPalabra from './ValidarPalabra'
import PalabrasVersiones from './PalabrasVersiones'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/login.tsx'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminPanel from './AdminPanel.tsx'
import Dashboard from './Dashboard.tsx'
import ValidadorDashboard from './ValidadorDashboard.tsx'
import { useEffect } from 'react'

// Componente para proteger rutas según el rol
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/" replace />
  }
  if (!allowedRoles.includes(user.rol)) {
    // Redirige al dashboard correspondiente si intenta acceder a una ruta no permitida
    if (user.rol === 'admin') return <Navigate to="/dashboard" replace />
    if (user.rol === 'valido') return <Navigate to="/validador-dashboard" replace />
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function Main() {
  useEffect(() => {
    document.title = "AImara Translation"
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/validador-dashboard"
        element={
          <ProtectedRoute allowedRoles={['valido']}>
            <ValidadorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/validar-palabra"
        element={
          <ProtectedRoute allowedRoles={['valido']}>
            <ValidarPalabra />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palabras-versiones"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PalabrasVersiones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-panel"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
