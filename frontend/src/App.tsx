import { useState, useEffect } from 'react'
import './App.css'
import logoSrc from './assets/Santa_Isabel.png'
import watermarkSrc from './assets/Escola_marca_de_água.png'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginModal } from './components/LoginModal'
import { Dashboard } from './components/Dashboard'

type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide'

function AppContent() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop')
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else if (width < 1536) {
        setScreenSize('desktop')
      } else {
        setScreenSize('wide')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  // Show loading state while checking authentication
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

  // If authenticated, show dashboard
  if (isAuthenticated) {
    return <Dashboard />
  }

  return (
    <>
      <div className="watermark" style={{ backgroundImage: `url(${watermarkSrc})` }}></div>
      <div className={`landing landing--${screenSize}`}>
      <header className="landing__header">
        <div className="brand">
          <img className="brand__logo" src={logoSrc} alt="Santa Isabel Escola" loading="eager" />
          <span className="brand__name">Santa Isabel Escola</span>
        </div>
        <nav className="nav">
          {screenSize !== 'mobile' && (
            <>
              <a className="nav__link" href="#features">Features</a>
              <a className="nav__link" href="#docs">Docs</a>
              <a className="nav__link" href="#contact">Contact</a>
            </>
          )}
          <button className="btn btn--small btn--primary" onClick={() => setIsLoginOpen(true)}>
            {screenSize === 'mobile' ? 'Login' : 'Login'}
          </button>
        </nav>
      </header>

      <main className="hero">
        <h1>Portal Escolar</h1>
        <p className="hero__subtitle">Para gestão de dados de alunos, professores, turmas e horários.</p>
        <div className="hero__actions">
          <button className="btn btn--primary" onClick={() => setIsLoginOpen(true)}>Login</button>
          <a className="btn" href="#learn-more">Learn More</a>
        </div>
      </main>

      <section id="features" className="features">
        <div className="feature">
          <h3>Students & Guardians</h3>
          <p>Track enrollment, progress, and family relationships.</p>
        </div>
        <div className="feature">
          <h3>Teachers & Subjects</h3>
          <p>Manage teacher profiles, departments, and subjects.</p>
        </div>
        <div className="feature">
          <h3>Classes & Scheduling</h3>
          <p>Organize timetables with periods, terms, and classrooms.</p>
        </div>
      </section>

      <footer className="footer">
        <span>© Santa Isabel Escola</span>
      </footer>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
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
