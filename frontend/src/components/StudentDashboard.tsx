import { useState } from 'react';
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

type StudentTab = 'overview' | 'grades' | 'schedule' | 'profile' | 'resources' | 'attendance' | 'assignments' | 'students';

export function StudentDashboard() {
  const { signOut } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');
  const isAdmin = user?.role === 'admin';

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
        Please sign in to access the portal
      </div>
    );
  }

  // Filter tabs based on user role
  const allTabs = [
    { id: 'overview' as StudentTab, label: 'Overview', icon: '🏠', showForAdmin: true },
    { id: 'grades' as StudentTab, label: 'Grades', icon: '📊', showForAdmin: true },
    { id: 'schedule' as StudentTab, label: 'Schedule', icon: '📅', showForAdmin: false },
    { id: 'profile' as StudentTab, label: 'Profile', icon: '👤', showForAdmin: false },
    { id: 'resources' as StudentTab, label: 'Resources', icon: '📚', showForAdmin: true },
    { id: 'attendance' as StudentTab, label: 'Attendance', icon: '✅', showForAdmin: true },
    { id: 'assignments' as StudentTab, label: 'Assignments', icon: '📝', showForAdmin: true },
    { id: 'students' as StudentTab, label: 'Students', icon: '👥', showForAdmin: true, adminOnly: true },
  ];

  // Filter tabs based on admin role
  const tabs = isAdmin 
    ? allTabs.filter(tab => tab.showForAdmin)
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
            <h2>Profile</h2>
            <p>Update your personal information and contact details.</p>
            <div className="placeholder-content">
              <p>Profile management coming soon...</p>
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
        if (isAdmin) {
          return <StudentsTable />;
        }
        return null;
      default:
        return (
          <div className="student-content">
            <h2>Student Portal</h2>
            <p>Access your academic information, grades, and schedule.</p>
            <div className="welcome-message">
              <p>Welcome to your student portal! Use the sidebar to navigate to different sections.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="student-header">
        <div className="student-header__brand">
          <img 
            className="student-header__logo" 
            src={logoSrc} 
            alt="Santa Isabel Escola" 
            loading="eager" 
          />
          <div className="student-header__title">
            <h1>Student Portal</h1>
            <span className="student-header__subtitle">Santa Isabel Escola</span>
          </div>
        </div>
        <div className="student-header__user">
          <span className="student-header__user-info">
            Student: {user.email}
          </span>
          <button className="btn btn--small" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn--small" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="student-dashboard__content">
        {/* Sidebar */}
        <aside className="student-sidebar">
          <nav className="student-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`student-nav__item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="student-nav__icon">{tab.icon}</span>
                <span className="student-nav__label">{tab.label}</span>
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
