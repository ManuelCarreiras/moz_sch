import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth, useUser } from './contexts/AuthContext'
import { Landing } from './components/Landing'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { StudentDashboard } from './components/StudentDashboard'
import { TeacherDashboard } from './components/TeacherDashboard'
import { GuardianDashboard } from './components/GuardianDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Loading...
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public Route component (redirects to appropriate dashboard if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const user = useUser()

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Loading...
      </div>
    )
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'admin' ? '/dashboard' : `/${user.role}`
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}

// Role-based routing removed for now - all authenticated users can access all endpoints

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route 
          path="/landing" 
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student" 
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guardian" 
          element={
            <ProtectedRoute>
              <GuardianDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
