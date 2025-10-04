import { useState } from 'react';
import { useAuth, useUser } from '../../contexts/AuthContext';
import { StudentsTable } from './StudentsTable';
import { TeachersTable } from './TeachersTable';
import { ClassesTable } from './ClassesTable';
import { ReportsView } from './ReportsView';

type AdminTab = 'students' | 'teachers' | 'classes' | 'reports' | 'settings';

export function AdminDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('students');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

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
    { id: 'students' as AdminTab, label: 'Students', icon: '👥' },
    { id: 'teachers' as AdminTab, label: 'Teachers', icon: '👨‍🏫' },
    { id: 'classes' as AdminTab, label: 'Classes', icon: '📚' },
    { id: 'reports' as AdminTab, label: 'Reports', icon: '📊' },
    { id: 'settings' as AdminTab, label: 'Settings', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsTable />;
      case 'teachers':
        return <TeachersTable />;
      case 'classes':
        return <ClassesTable />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return (
          <div className="admin-content">
            <h2>Settings</h2>
            <p>System settings and configuration options will be available here.</p>
          </div>
        );
      default:
        return <StudentsTable />;
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
