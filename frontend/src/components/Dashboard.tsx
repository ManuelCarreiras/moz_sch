import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '../contexts/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';

export function Dashboard() {
  const { isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();

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
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Please sign in to access the portal
      </div>
    );
  }

  // Redirect non-admin users to their respective portals
  useEffect(() => {
    if (user && user.role !== 'admin') {
      const target = `/${user.role}`;
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  // Only admins see the admin dashboard
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // Fallback while redirecting
  return null;
}
