import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '../../contexts/AuthContext';
import { ClassesTable } from './ClassesTable';
import { ReportsView } from './ReportsView';
import { DepartmentTable } from './DepartmentTable';
import { SubjectTable } from './SubjectTable';
import { ClassroomManagement } from './ClassroomManagement';
import { SimpleGuardianWizard } from './SimpleGuardianWizard';
import { StudentGuardianAssignment } from './StudentGuardianAssignment';
import { TeacherDepartmentAssignment } from './TeacherDepartmentAssignment';
import { SchoolYearManagement } from './SchoolYearManagement';
import AcademicFoundationManagement from './AcademicFoundationManagement';
import AcademicSetupWizard from './AcademicSetupWizard';
import { StudentClassEnrollment } from './StudentClassEnrollment';
import { YearLevelTimetable } from './YearLevelTimetable';
import logoSrc from '../../assets/Santa_Isabel.png';

type AdminTab = 'overview' | 'students' | 'teachers' | 'guardians' | 'academic-setup' | 'academic-foundation' | 'academic-wizard' | 'classes' | 'reports' | 'portals' | 'settings';
type AcademicSetupTab = 'overview' | 'departments' | 'subjects' | 'classrooms' | 'teacher-departments' | 'school-year-management';
type GuardianManagementTab = 'overview' | 'guardian-creation' | 'student-assignment';
type ClassManagementTab = 'classes' | 'enrollments' | 'timetable';

export function AdminDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [activeAcademicTab, setActiveAcademicTab] = useState<AcademicSetupTab>('overview');
  const [activeGuardianTab, setActiveGuardianTab] = useState<GuardianManagementTab>('overview');
  const [activeClassTab, setActiveClassTab] = useState<ClassManagementTab>('classes');

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
    // Guardians now handled within Admin Dashboard (no redirect)
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
    { id: 'guardians' as AdminTab, label: 'Guardian Management', icon: '👨‍👩‍👧‍👦' },
    { id: 'academic-setup' as AdminTab, label: 'Academic Setup', icon: '🏗️' },
    { id: 'academic-foundation' as AdminTab, label: 'Academic Foundation', icon: '📋' },
    { id: 'academic-wizard' as AdminTab, label: 'Academic Setup Wizard', icon: '🧙‍♂️' },
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
                <p>Click "Students", "Teachers", or "Guardians" in the sidebar to navigate to those portals.</p>
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    • <strong>Students</strong> → localhost:3000/student<br/>
                    • <strong>Teachers</strong> → localhost:3000/teacher<br/>
                    • <strong>Guardians</strong> → localhost:3000/guardian
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
      case 'guardians':
        if (activeGuardianTab === 'guardian-creation') {
          return (
            <div className="admin-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <button 
                  className="btn btn--secondary"
                  onClick={() => setActiveGuardianTab('overview')}
                >
                  ← Back to Guardian Management
                </button>
                <div>
                  <h2>Create New Guardian</h2>
                  <p>Add a new guardian to the system.</p>
                </div>
              </div>
              <SimpleGuardianWizard 
                onClose={() => setActiveGuardianTab('overview')}
                onSuccess={() => {
                  setActiveGuardianTab('overview');
                }}
              />
            </div>
          );
        }
        
        if (activeGuardianTab === 'student-assignment') {
          return (
            <div className="admin-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <button 
                  className="btn btn--secondary"
                  onClick={() => setActiveGuardianTab('overview')}
                >
                  ← Back to Guardian Management
                </button>
                <div>
                  <h2>Assign Guardian to Student</h2>
                  <p>Link guardians with students and define their relationships.</p>
                </div>
              </div>
              <StudentGuardianAssignment 
                onClose={() => setActiveGuardianTab('overview')}
                onSuccess={() => {
                  setActiveGuardianTab('overview');
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="admin-content">
            <h2>Guardian Management</h2>
            <p>Manage guardians and their relationships with students.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3>👨‍👩‍👧‍👦 Guardian Creation</h3>
                <p>Create new guardians with personal information and contact details</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveGuardianTab('guardian-creation')}
                >
                  Create New Guardian
                </button>
              </div>

              <div className="feature-card">
                <h3>🔗 Student Assignment</h3>
                <p>Assign guardians to students and define relationship types (Parent, Grandparent, etc.)</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveGuardianTab('student-assignment')}
                >
                  Assign Guardian to Student
                </button>
              </div>

            </div>
          </div>
        );
      case 'academic-setup':
        if (activeAcademicTab === 'departments') {
          return <DepartmentTable onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'subjects') {
          return <SubjectTable onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'teacher-departments') {
          return <TeacherDepartmentAssignment onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'school-year-management') {
          return <SchoolYearManagement onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'classrooms') {
          return <ClassroomManagement onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        return (
          <div className="admin-content">
            <h2>Academic Setup</h2>
            <p>Configure the foundational academic infrastructure for your school.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3>🏢 Departments</h3>
                <p>Organize subjects into departments (Mathematics, Science, Languages, Arts, etc.)</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('departments')}
                >
                  Manage Departments
                </button>
              </div>

              <div className="feature-card">
                <h3>📚 Subjects & Score Ranges</h3>
                <p>Define individual subjects, courses, and their grading scales. Create score ranges and assign them to subjects.</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('subjects')}
                >
                  Manage Subjects & Score Ranges
                </button>
              </div>

              <div className="feature-card">
                <h3>🏫 Classroom Management</h3>
                <p>Manage classroom types and physical classroom spaces with capacity planning</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('classrooms')}
                >
                  Manage Classrooms
                </button>
              </div>

              <div className="feature-card">
                <h3>👨‍🏫 Teacher Department Assignment</h3>
                <p>Assign teachers to departments for better organization and class management</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('teacher-departments')}
                >
                  Assign Teachers to Departments
                </button>
              </div>

              <div className="feature-card">
                <h3>📅 School Year Management</h3>
                <p>Complete academic structure: year levels, school years, and student assignments</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('school-year-management')}
                >
                  Manage School Years
                </button>
              </div>
            </div>
          </div>
        );
      case 'academic-foundation':
        return <AcademicFoundationManagement />;
      case 'academic-wizard':
        return <AcademicSetupWizard />;
      case 'classes':
        if (activeClassTab === 'enrollments') {
          return <StudentClassEnrollment onBack={() => setActiveClassTab('classes')} />;
        }
        if (activeClassTab === 'timetable') {
          return <YearLevelTimetable onBack={() => setActiveClassTab('classes')} />;
        }
        return (
          <ClassesTable 
            onNavigateToEnrollments={() => setActiveClassTab('enrollments')}
            onNavigateToTimetable={() => setActiveClassTab('timetable')}
          />
        );
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
              <div className="feature" style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3>Guardian Management</h3>
                <p>Guardian management is now integrated into the Admin Dashboard.</p>
                <button 
                  className="btn btn--primary" 
                  onClick={() => setActiveTab('guardians')}
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  Go to Guardian Management
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
            src={logoSrc} 
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
