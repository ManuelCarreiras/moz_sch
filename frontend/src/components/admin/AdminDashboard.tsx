import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '../../contexts/AuthContext';
import { ClassesTable } from './ClassesTable';
import { ReportsView } from './ReportsView';

type AdminTab = 'overview' | 'students' | 'teachers' | 'classes' | 'reports' | 'portals' | 'settings';

export function AdminDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handlePortalAccess = (portalType: 'teacher' | 'student') => {
    navigate(`/${portalType}`);
  };

  // Handle navigation when tab changes
  useEffect(() => {
    if (activeTab === 'students') {
      navigate('/student', { replace: true });
    } else if (activeTab === 'teachers') {
      navigate('/teacher', { replace: true });
    }
  }, [activeTab, navigate]);

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

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Access denied. Admin privileges required.
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: '🏠' },
    { id: 'students' as AdminTab, label: 'Students', icon: '👥' },
    { id: 'teachers' as AdminTab, label: 'Teachers', icon: '👨‍🏫' },
    { id: 'classes' as AdminTab, label: 'Classes', icon: '📚' },
    { id: 'reports' as AdminTab, label: 'Reports', icon: '📊' },
    { id: 'portals' as AdminTab, label: 'Portal Access', icon: '🚪' },
    { id: 'settings' as AdminTab, label: 'Settings', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="admin-content">
            <h2>Admin Overview</h2>
            <p>Welcome to the Santa Isabel Escola Admin Portal. Manage all aspects of the school system from here.</p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 'var(--space-lg)', 
              marginTop: 'var(--space-lg)' 
            }}>
              <div className="feature" style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3>User Portal Access</h3>
                <p>Click "Students" or "Teachers" in the sidebar to navigate to those portals.</p>
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    • <strong>Students</strong> → localhost:3000/student<br/>
                    • <strong>Teachers</strong> → localhost:3000/teacher
                  </p>
                </div>
              </div>
              
              <div className="feature" style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3>Admin Management Tools</h3>
                <p>Administrative functions for managing school data (stays within admin dashboard).</p>
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <button 
                    className="btn btn--small" 
                    onClick={() => setActiveTab('classes')}
                    style={{ marginRight: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}
                  >
                    📚 Manage Classes
                  </button>
                  <button 
                    className="btn btn--small" 
                    onClick={() => setActiveTab('reports')}
                    style={{ marginRight: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}
                  >
                    📊 View Reports
                  </button>
                  <button 
                    className="btn btn--small" 
                    onClick={() => setActiveTab('settings')}
                    style={{ marginBottom: 'var(--space-sm)' }}
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'students':
        // Navigation handled by useEffect
        return (
          <div className="admin-content">
            <h2>Redirecting to Student Portal...</h2>
            <p>You will be redirected to the student portal shortly.</p>
          </div>
        );
      case 'teachers':
        // Navigation handled by useEffect
        return (
          <div className="admin-content">
            <h2>Redirecting to Teacher Portal...</h2>
            <p>You will be redirected to the teacher portal shortly.</p>
          </div>
        );
      case 'classes':
        return <ClassesTable />;
      case 'reports':
        return <ReportsView />;
      case 'portals':
        return (
          <div className="admin-content">
            <h2>Portal Access</h2>
            <p>Access different user portals to experience the system from different perspectives.</p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 'var(--space-lg)', 
              marginTop: 'var(--space-lg)' 
            }}>
              <div className="feature" style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3>Teacher Portal</h3>
                <p>Access the teacher dashboard to manage classes, students, and grades.</p>
                <button 
                  className="btn btn--primary" 
                  onClick={() => handlePortalAccess('teacher')}
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  Go to Teacher Portal
                </button>
              </div>
              <div className="feature" style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3>Student Portal</h3>
                <p>Access the student dashboard to view grades, schedule, and assignments.</p>
                <button 
                  className="btn btn--primary" 
                  onClick={() => handlePortalAccess('student')}
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  Go to Student Portal
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="admin-content">
            <h2>Settings</h2>
            <p>System settings and configuration options will be available here.</p>
          </div>
        );
      default:
        return (
          <div className="admin-content">
            <h2>Admin Overview</h2>
            <p>Welcome to the Santa Isabel Escola Admin Portal. Use the sidebar to navigate.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <img 
            className="admin-header__logo" 
            src="/src/assets/Santa_Isabel.png" 
            alt="Santa Isabel Escola" 
            loading="eager" 
          />
          <div className="admin-header__title">
            <h1>Admin Portal</h1>
            <span className="admin-header__subtitle">Santa Isabel Escola</span>
          </div>
        </div>
        <div className="admin-header__user">
          <span className="admin-header__user-info">
            Welcome, {user.email}
          </span>
          <button className="btn btn--small" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-main">
        {/* Sidebar Navigation */}
        <nav className="admin-sidebar">
          <div className="admin-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`admin-nav__item ${activeTab === tab.id ? 'admin-nav__item--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="admin-nav__icon">{tab.icon}</span>
                <span className="admin-nav__label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className="admin-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
