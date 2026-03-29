import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoSrc from '../../assets/Santa_Isabel.png'

type MarketingLayoutProps = {
  children: React.ReactNode
}

type MarketingTheme = 'dark' | 'light'

const STORAGE_KEY = 'marketing_theme'

function getInitialTheme(): MarketingTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* ignore */ }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

function applyMarketingTheme(theme: MarketingTheme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

const navLinks = [
  { to: '/landing', label: 'Home' },
  { to: '/school-management-system', label: 'Platform' },
  { to: '/features', label: 'Features' },
  { to: '/contact', label: 'Contact' },
]

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setThemeState] = useState<MarketingTheme>(getInitialTheme)

  useEffect(() => {
    applyMarketingTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const next: MarketingTheme = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/landing" className="flex items-center gap-3 no-underline">
            <img className="h-9 w-9 rounded-lg object-contain" src={logoSrc} alt="Santa Isabel Escola" loading="eager" />
            <span className="text-lg font-bold tracking-tight text-text">Santa Isabel</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-text no-underline"
              >
                {l.label}
              </Link>
            ))}

            {/* Theme toggle */}
            <button
              type="button"
              className="ml-2 inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-text"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="ml-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </nav>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-text"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-text"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="border-t border-border/40 bg-bg/95 backdrop-blur-lg md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-muted transition-colors hover:bg-surface hover:text-text no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                className="mt-2 w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-600"
                onClick={() => { navigate('/login'); setMobileOpen(false) }}
              >
                Login
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-4">
              <Link to="/landing" className="flex items-center gap-3 no-underline">
                <img className="h-8 w-8 rounded-lg object-contain" src={logoSrc} alt="Santa Isabel Escola" />
                <span className="text-base font-bold text-text">Santa Isabel</span>
              </Link>
              <p className="text-sm leading-relaxed text-muted">
                All-in-one school management platform. Gradebook, timetable, finances, and more in one system.
              </p>
            </div>

            {/* Features column */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Features</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                <li><Link to="/features/gradebook" className="text-sm text-muted transition-colors hover:text-primary no-underline">Gradebook</Link></li>
                <li><Link to="/features/school-timetable" className="text-sm text-muted transition-colors hover:text-primary no-underline">Timetable</Link></li>
                <li><Link to="/features/financial-management" className="text-sm text-muted transition-colors hover:text-primary no-underline">Financial Management</Link></li>
                <li><Link to="/features/role-based-access" className="text-sm text-muted transition-colors hover:text-primary no-underline">Role-Based Access</Link></li>
              </ul>
            </div>

            {/* Platform column */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Platform</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                <li><Link to="/school-management-system" className="text-sm text-muted transition-colors hover:text-primary no-underline">Overview</Link></li>
                <li><Link to="/features" className="text-sm text-muted transition-colors hover:text-primary no-underline">All Features</Link></li>
                <li><Link to="/contact" className="text-sm text-muted transition-colors hover:text-primary no-underline">Request a Demo</Link></li>
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Legal</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                <li><span className="text-sm text-muted/60">Privacy Policy (coming soon)</span></li>
                <li><span className="text-sm text-muted/60">Terms of Service (coming soon)</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border/30 pt-6 text-center">
            <p className="text-sm text-muted">
              &copy; {new Date().getFullYear()} Santa Isabel Escola. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
