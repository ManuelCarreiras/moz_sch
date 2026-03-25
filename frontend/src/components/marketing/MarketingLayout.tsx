import { Link, useNavigate } from 'react-router-dom'
import logoSrc from '../../assets/Santa_Isabel.png'
import watermarkSrc from '../../assets/Escola_marca_de_água.png'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const navigate = useNavigate()

  return (
    <>
      <div className="watermark" style={{ backgroundImage: `url(${watermarkSrc})` }}></div>
      <div className="marketing">
        <header className="landing__header">
          <div className="brand">
            <img className="brand__logo" src={logoSrc} alt="Santa Isabel Escola" loading="eager" />
            <span className="brand__name">Santa Isabel Escola</span>
          </div>

          <nav className="nav">
            <Link className="nav__link" to="/landing">Home</Link>
            <Link className="nav__link" to="/school-management-system">School management system</Link>
            <Link className="nav__link" to="/features">Features</Link>
            <button className="btn btn--small btn--primary" onClick={() => navigate('/login')}>
              Login
            </button>
          </nav>
        </header>

        <main className="marketing__main">
          {children}
        </main>

        <footer className="footer">
          <span>© {new Date().getFullYear()} Santa Isabel Escola</span>
        </footer>
      </div>
    </>
  )
}

