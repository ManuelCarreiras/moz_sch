import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useUser } from '../contexts/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';

export function Dashboard() {
  const { t } = useTranslation();
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
        {t('common.loading')}
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
        {t('dashboard.pleaseSignIn')}
      </div>
    );
  }

  // Admin-like roles (admin, financial, secretary) see the admin dashboard
  const adminLikeRoles = ['admin', 'financial', 'secretary'];
  
  // Redirect non-admin-like users to their respective portals
  useEffect(() => {
    if (user && !adminLikeRoles.includes(user.role)) {
      const target = `/${user.role}`;
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  // Admin, financial, and secretary see the admin dashboard (with role-based tabs)
  if (adminLikeRoles.includes(user.role)) {
    return <AdminDashboard />;
  }

  // Fallback while redirecting
  return null;
}
