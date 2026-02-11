import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logoSrc from '../assets/Santa_Isabel.png'
import watermarkSrc from '../assets/Escola_marca_de_água.png'

type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide'

export function Landing() {
  const { t } = useTranslation()
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop')
  const navigate = useNavigate()

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

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <>
      <div className="watermark" style={{ backgroundImage: `url(${watermarkSrc})` }}></div>
      <div className={`landing landing--${screenSize}`}>
        <header className="landing__header">
          <div className="brand">
            <img className="brand__logo" src={logoSrc} alt={t('common.schoolName')} loading="eager" />
            <span className="brand__name">{t('common.schoolName')}</span>
          </div>
          <nav className="nav">
            {screenSize !== 'mobile' && (
              <>
                <a className="nav__link" href="#features">{t('landing.features')}</a>
                <a className="nav__link" href="#docs">{t('landing.docs')}</a>
                <a className="nav__link" href="#contact">{t('landing.contact')}</a>
              </>
            )}
            <button className="btn btn--small btn--primary" onClick={handleLoginClick}>
              {t('landing.login')}
            </button>
          </nav>
        </header>

        <main className="hero">
          <h1>{t('landing.title')}</h1>
          <p className="hero__subtitle">{t('landing.subtitle')}</p>
          <div className="hero__actions">
            <button className="btn btn--primary" onClick={handleLoginClick}>{t('landing.login')}</button>
            <a className="btn" href="#learn-more">{t('landing.learnMore')}</a>
          </div>
        </main>

        <section id="features" className="features">
          <div className="feature">
            <h3>{t('landing.feature1Title')}</h3>
            <p>{t('landing.feature1Desc')}</p>
          </div>
          <div className="feature">
            <h3>{t('landing.feature2Title')}</h3>
            <p>{t('landing.feature2Desc')}</p>
          </div>
          <div className="feature">
            <h3>{t('landing.feature3Title')}</h3>
            <p>{t('landing.feature3Desc')}</p>
          </div>
        </section>

        <footer className="footer">
          <span>{t('landing.copyright')}</span>
        </footer>
      </div>
    </>
  )
}
