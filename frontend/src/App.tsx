import { useState, useEffect } from 'react'
import './App.css'
import logoSrc from './assets/Santa_Isabel.png'
import watermarkSrc from './assets/Escola_marca_de_água.png'

type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop')

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

  const handleLogin = (portal: string) => {
    alert(`${portal} login TBD`)
    setIsLoginOpen(false)
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

      {isLoginOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={() => setIsLoginOpen(false)}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 id="login-title">Choose your portal</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setIsLoginOpen(false)}>✕</button>
            </div>
            <div className="modal__content">
              <button className="portal" onClick={() => handleLogin('Admin')}>Admin Portal</button>
              <button className="portal" onClick={() => handleLogin('Teacher')}>Teacher Portal</button>
              <button className="portal" onClick={() => handleLogin('Student')}>Student Portal</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
