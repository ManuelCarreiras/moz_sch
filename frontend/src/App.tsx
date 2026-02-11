import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import { AuthProvider, useAuth, useUser } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Landing } from './components/Landing'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { StudentDashboard } from './components/StudentDashboard'
import { TeacherDashboard } from './components/TeacherDashboard'
import { GuardianDashboard } from './components/GuardianDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()

  // Always wait for auth initialization to complete before making routing decisions
  // This prevents redirecting to login on page refresh when user is still authenticated
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
        {t('common.loading')}
      </div>
    )
  }

  // Only redirect to login if we're sure the user is not authenticated (after loading completes)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}

// Public Route component (redirects to appropriate dashboard if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const user = useUser()

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user role
    // Admin, financial, and secretary all go to /dashboard (AdminDashboard with role-based tabs)
    const adminRoles = ['admin', 'financial', 'secretary']
    const redirectPath = adminRoles.includes(user.role) ? '/dashboard' : `/${user.role}`
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
        {/* Financial and Secretary routes - redirect to dashboard which handles role-based tabs */}
        <Route 
          path="/financial" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/secretary" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
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
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
