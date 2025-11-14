import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Servizi } from './pages/Servizi'
import { Fissi } from './pages/Fissi'
import { Risorse } from './pages/Risorse'
import { Ristoranti } from './pages/Ristoranti'
import { Ruoli } from './pages/Ruoli'

// Componente per route pubbliche (login) - redirect se già autenticato
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Caricamento...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servizi"
        element={
          <ProtectedRoute>
            <Layout>
              <Servizi />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fissi"
        element={
          <ProtectedRoute>
            <Layout>
              <Fissi />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/risorse"
        element={
          <ProtectedRoute>
            <Layout>
              <Risorse />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ristoranti"
        element={
          <ProtectedRoute>
            <Layout>
              <Ristoranti />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ruoli"
        element={
          <ProtectedRoute>
            <Layout>
              <Ruoli />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
