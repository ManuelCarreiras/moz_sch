import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortalLogin = async (portal: string) => {
    // For now, show a placeholder
    alert(`${portal} login will be implemented with Cognito integration`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 id="login-title">Choose your portal</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__content">
          <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: 'var(--text-base)',
                }}
                placeholder="Enter your email"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: 'var(--text-base)',
                }}
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <div style={{
                color: '#ff6b6b',
                fontSize: 'var(--text-sm)',
                marginBottom: '1rem',
                padding: 'var(--space-xs)',
                background: 'rgba(255, 107, 107, 0.1)',
                borderRadius: '0.25rem',
                border: '1px solid rgba(255, 107, 107, 0.3)',
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'var(--text)',
                fontSize: 'var(--text-base)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            or
          </div>
          
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            <button className="portal" onClick={() => handlePortalLogin('Admin')}>
              Admin Portal
            </button>
            <button className="portal" onClick={() => handlePortalLogin('Teacher')}>
              Teacher Portal
            </button>
            <button className="portal" onClick={() => handlePortalLogin('Student')}>
              Student Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
