import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '../contexts/AuthContext';
import logoSrc from '../assets/Santa_Isabel.png';
import watermarkSrc from '../assets/Escola_marca_de_água.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error, isAuthenticated, getAccessToken, signInStep, completeNewPassword } = useAuth();
  const user = useUser();
  const navigate = useNavigate();

  const requiresNewPassword = useMemo(() => {
    return signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' || signInStep === 'NEW_PASSWORD_REQUIRED';
  }, [signInStep]);

  // After authentication succeeds, route based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/dashboard' : `/${user.role}`;
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Try to immediately verify session and route
      const token = await getAccessToken?.();
      // Fallback if hook shape changes
      const resolvedToken = token || null;
      if (resolvedToken) {
        const target = (user && user.role === 'admin') ? '/dashboard' : `/${user?.role || 'student'}`;
        navigate(target, { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/landing');
  };

  // NEW PASSWORD REQUIRED handlers
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleCompleteNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setPwSubmitting(true);
    try {
      await completeNewPassword(newPassword);
      const target = (user && user.role === 'admin') ? '/dashboard' : `/${user?.role || 'student'}`;
      navigate(target, { replace: true });
    } catch (err) {
      console.error('Failed to set new password:', err);
    } finally {
      setPwSubmitting(false);
    }
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
            {!requiresNewPassword ? (
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
            ) : (
            <form onSubmit={handleCompleteNewPassword}>
              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter a new password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={pwSubmitting || !newPassword || newPassword !== confirmPassword}
                  className="btn btn--primary"
                  style={{ 
                    width: '100%',
                    fontSize: 'var(--text-base)',
                    padding: 'var(--space-sm) var(--space-md)'
                  }}
                >
                  {pwSubmitting ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </form>
            )}
          </div>
        </main>

        <footer className="footer">
          <span>© Santa Isabel Escola</span>
        </footer>
      </div>
    </>
  );
}
