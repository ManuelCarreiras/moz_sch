import { useState } from 'react';
import { useAuth, useUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSrc from '../assets/Santa_Isabel.png';
import { TeacherWizard } from './admin/TeacherWizard';
import { TeacherSchedule } from './TeacherSchedule';
import AssignmentList from './teacher/AssignmentList';

type TeacherTab = 'overview' | 'classes' | 'students' | 'grades' | 'resources' | 'attendance' | 'assignments';

export function TeacherDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleTeacherCreated = () => {
    // Refresh teacher list or show success message
    console.log('Teacher created successfully');
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

  const tabs = [
    { id: 'overview' as TeacherTab, label: 'Overview', icon: '🏠' },
    { id: 'classes' as TeacherTab, label: 'My Classes', icon: '📚' },
    { id: 'students' as TeacherTab, label: 'Students', icon: '👥' },
    { id: 'grades' as TeacherTab, label: 'Grades', icon: '📊' },
    { id: 'resources' as TeacherTab, label: 'Resources', icon: '📖' },
    { id: 'attendance' as TeacherTab, label: 'Attendance', icon: '✅' },
    { id: 'assignments' as TeacherTab, label: 'Assignments', icon: '📝' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'classes':
        return <TeacherSchedule />;
      case 'students':
        return (
          <div className="teacher-content">
            <h2>Students</h2>
            <p>Access student information and track academic progress.</p>
            <div className="placeholder-content">
              <p>Student management functionality coming soon...</p>
            </div>
          </div>
        );
      case 'grades':
        return (
          <div className="teacher-content">
            <h2>Grades</h2>
            <p>Enter and manage student grades and assessments.</p>
            <div className="placeholder-content">
              <p>Grade management functionality coming soon...</p>
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="teacher-content">
            <h2>Resources</h2>
            <p>Access teaching materials and educational resources.</p>
            <div className="placeholder-content">
              <p>Resources functionality coming soon...</p>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="teacher-content">
            <h2>Attendance</h2>
            <p>Track student attendance and manage records.</p>
            <div className="placeholder-content">
              <p>Attendance tracking functionality coming soon...</p>
            </div>
          </div>
        );
      case 'assignments':
        return <AssignmentList />;
      default:
        return (
          <div className="teacher-content">
            <h2>Teacher Portal</h2>
            <p>Manage your classes, students, and teaching resources.</p>
            <div className="welcome-message">
              <p>Welcome to your teacher portal! Use the sidebar to navigate to different sections.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <header className="teacher-header">
        <div className="teacher-header__brand">
          <img 
            className="teacher-header__logo" 
            src={logoSrc} 
            alt="Santa Isabel Escola" 
            loading="eager" 
          />
          <div className="teacher-header__title">
            <h1>Teacher Portal</h1>
            <span className="teacher-header__subtitle">Santa Isabel Escola</span>
          </div>
        </div>
        <div className="teacher-header__user">
          <span className="teacher-header__user-info">
            Teacher: {user.email}
          </span>
          <button className="btn btn--small" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn--small" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="teacher-dashboard__content">
        {/* Sidebar */}
        <aside className="teacher-sidebar">
          <nav className="teacher-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`teacher-nav__item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="teacher-nav__icon">{tab.icon}</span>
                <span className="teacher-nav__label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="teacher-main">
          {activeTab === 'overview' && (
            <div className="teacher-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div>
                  <h2>Teacher Portal</h2>
                  <p>Manage your classes, students, and teaching resources.</p>
                </div>
                {isAdmin && (
                  <button 
                    className="btn btn--primary"
                    onClick={() => setShowCreateTeacher(true)}
                    style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-sm) var(--space-md)' }}
                  >
                    Create New Teacher
                  </button>
                )}
              </div>
              <div className="welcome-message">
                <p>Welcome to your teacher portal! Use the sidebar to navigate to different sections.</p>
              </div>
            </div>
          )}
          {activeTab !== 'overview' && renderTabContent()}
        </main>
      </div>

      {/* Create Teacher Modal */}
      {showCreateTeacher && (
        <TeacherWizard 
          onClose={() => setShowCreateTeacher(false)}
          onSuccess={handleTeacherCreated}
        />
      )}
    </div>
  );
}
