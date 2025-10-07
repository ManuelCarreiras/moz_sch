import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSrc from '../assets/Santa_Isabel.png';
import watermarkSrc from '../assets/Escola_marca_de_água.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      // The redirect will be handled by the PublicRoute component
      // which will redirect authenticated users to their appropriate dashboard
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/landing');
  };

  return (
    <>
      <div className="watermark" style={{ backgroundImage: `url(${watermarkSrc})` }}></div>
      <div className="landing">
        <header className="landing__header">
          <div className="brand">
            <img className="brand__logo" src={logoSrc} alt="Santa Isabel Escola" loading="eager" />
            <span className="brand__name">Santa Isabel Escola</span>
          </div>
          <nav className="nav">
            <button className="btn btn--small" onClick={handleBackToLanding}>
              Back to Home
            </button>
          </nav>
        </header>

        <main className="hero">
          <div style={{ 
            maxWidth: '350px', 
            margin: '0 auto',
            backgroundColor: 'var(--surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h1 style={{ 
              textAlign: 'center', 
              marginBottom: 'var(--space-md)',
              fontSize: 'var(--text-2xl)',
              fontWeight: '600'
            }}>Sign In</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              {error && (
                <div className="error-message" style={{ 
                  marginBottom: 'var(--space-md)',
                  fontSize: 'var(--text-sm)',
                  padding: 'var(--space-sm)'
                }}>
                  {error}
                </div>
              )}
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="btn btn--primary"
                  style={{ 
                    width: '100%',
                    fontSize: 'var(--text-base)',
                    padding: 'var(--space-sm) var(--space-md)'
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="footer">
          <span>© Santa Isabel Escola</span>
        </footer>
      </div>
    </>
  );
}
