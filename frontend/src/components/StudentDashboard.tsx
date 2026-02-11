import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSrc from '../assets/Santa_Isabel.png';
import { StudentSchedule } from './StudentSchedule';
import StudentAssignments from './student/StudentAssignments';
import StudentGrades from './student/StudentGrades';
import StudentAttendance from './student/StudentAttendance';
import StudentOverview from './student/StudentOverview';
import StudentResources from './student/StudentResources';
import { StudentsTable } from './admin/StudentsTable';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';

type StudentTab = 'overview' | 'grades' | 'schedule' | 'profile' | 'resources' | 'attendance' | 'assignments' | 'students';

export function StudentDashboard() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isSecretary = user?.role === 'secretary';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };


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

  // Filter tabs based on user role
  const allTabs = [
    { id: 'overview' as StudentTab, labelKey: 'student.tabs.overview', icon: '🏠', showForAdmin: true },
    { id: 'grades' as StudentTab, labelKey: 'student.tabs.grades', icon: '📊', showForAdmin: true },
    { id: 'schedule' as StudentTab, labelKey: 'student.tabs.schedule', icon: '📅', showForAdmin: false },
    { id: 'profile' as StudentTab, labelKey: 'student.tabs.profile', icon: '👤', showForAdmin: false },
    { id: 'resources' as StudentTab, labelKey: 'student.tabs.resources', icon: '📚', showForAdmin: true },
    { id: 'attendance' as StudentTab, labelKey: 'student.tabs.attendance', icon: '✅', showForAdmin: true },
    { id: 'assignments' as StudentTab, labelKey: 'student.tabs.assignments', icon: '📝', showForAdmin: true },
    { id: 'students' as StudentTab, labelKey: 'student.tabs.students', icon: '👥', showForAdmin: true, adminOnly: true },
  ];

  // Filter tabs based on user role
  const tabs = isAdmin 
    ? allTabs.filter(tab => tab.showForAdmin)
    : isSecretary
      ? allTabs.filter(tab => ['overview', 'students'].includes(tab.id))
      : allTabs;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'grades':
        return <StudentGrades />;
      case 'schedule':
        return <StudentSchedule />;
      case 'profile':
        return (
          <div className="student-content">
            <h2>{t('student.profile')}</h2>
            <p>{t('student.profileDesc')}</p>
            <div className="placeholder-content">
              <p>{t('student.profileComingSoon')}</p>
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="student-content">
            <StudentResources />
          </div>
        );
      case 'attendance':
        return <StudentAttendance />;
      case 'assignments':
        return (
          <div className="student-content">
            <StudentAssignments />
          </div>
        );
      case 'students':
        if (isAdmin || isSecretary) {
          return <StudentsTable />;
        }
        return null;
      default:
        return (
          <div className="student-content">
            <h2>{t('student.portalTitle')}</h2>
            <p>{t('student.portalSubtitle')}</p>
            <div className="welcome-message">
              <p>{t('student.welcomeMessage')}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="student-dashboard">
      {/* Sidebar backdrop - mobile only */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="button"
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        aria-label="Close menu"
      />
      {/* Header */}
      <header className="student-header">
        <div className="student-header__brand">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('common.openMenu')}
          >
            ☰
          </button>
          <img 
            className="student-header__logo" 
            src={logoSrc} 
            alt={t('common.schoolName')} 
            loading="eager" 
          />
          <div className="student-header__title">
            <h1>{t('student.portalTitle')}</h1>
            <span className="student-header__subtitle">{t('common.schoolName')}</span>
          </div>
        </div>
        <div className="student-header__user">
          <LanguageSelector />
          <ThemeSelector />
          <span className="student-header__user-info">
            {t('common.student')}: {user.email}
          </span>
          <button className="btn btn--small" onClick={() => navigate('/dashboard')}>
            {t('common.backToDashboard')}
          </button>
          <button className="btn btn--small" onClick={handleSignOut}>
            {t('common.signOut')}
          </button>
        </div>
      </header>

      <div className="student-dashboard__content">
        {/* Sidebar */}
        <aside className={`student-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <nav className="student-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`student-nav__item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="student-nav__icon">{tab.icon}</span>
                <span className="student-nav__label">{t(tab.labelKey)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="student-main">
          {activeTab === 'overview' && (
            <div className="student-content">
              <StudentOverview />
            </div>
          )}
          {activeTab !== 'overview' && renderTabContent()}
        </main>
      </div>

    </div>
  );
}
