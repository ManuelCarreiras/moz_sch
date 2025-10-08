import { useState } from 'react';
import { useAuth, useUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSrc from '../assets/Santa_Isabel.png';

type StudentTab = 'overview' | 'grades' | 'schedule' | 'profile' | 'resources' | 'attendance' | 'assignments';

export function StudentDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    given_name: '',
    middle_name: '',
    surname: '',
    date_of_birth: '',
    gender: '',
    enrollment_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiBaseUrl}/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentForm)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Student created successfully:', result);
        
        // Reset form and close modal
        setStudentForm({
          given_name: '',
          middle_name: '',
          surname: '',
          date_of_birth: '',
          gender: '',
          enrollment_date: ''
        });
        setShowCreateStudent(false);
        
        // You could add a success message here
        alert('Student created successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to create student:', error);
        alert('Failed to create student: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error creating student: ' + error);
    } finally {
      setIsSubmitting(false);
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
    { id: 'overview' as StudentTab, label: 'Overview', icon: '🏠' },
    { id: 'grades' as StudentTab, label: 'My Grades', icon: '📊' },
    { id: 'schedule' as StudentTab, label: 'Schedule', icon: '📅' },
    { id: 'profile' as StudentTab, label: 'Profile', icon: '👤' },
    { id: 'resources' as StudentTab, label: 'Resources', icon: '📚' },
    { id: 'attendance' as StudentTab, label: 'Attendance', icon: '✅' },
    { id: 'assignments' as StudentTab, label: 'Assignments', icon: '📝' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'grades':
        return (
          <div className="student-content">
            <h2>My Grades</h2>
            <p>View your academic grades and performance across all subjects.</p>
            <div className="placeholder-content">
              <p>Grades functionality coming soon...</p>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="student-content">
            <h2>Schedule</h2>
            <p>Check your class schedule and upcoming assignments.</p>
            <div className="placeholder-content">
              <p>Schedule functionality coming soon...</p>
            </div>
          </div>
        );
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
            <h2>Resources</h2>
            <p>Access learning materials and educational resources.</p>
            <div className="placeholder-content">
              <p>Resources functionality coming soon...</p>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="student-content">
            <h2>Attendance</h2>
            <p>View your attendance records and absences.</p>
            <div className="placeholder-content">
              <p>Attendance tracking coming soon...</p>
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="student-content">
            <h2>Assignments</h2>
            <p>Track your homework and project deadlines.</p>
            <div className="placeholder-content">
              <p>Assignment tracking coming soon...</p>
            </div>
          </div>
        );
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div>
                  <h2>Student Portal</h2>
                  <p>Access your academic information, grades, and schedule.</p>
                </div>
                <button 
                  className="btn btn--primary"
                  onClick={() => setShowCreateStudent(true)}
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-sm) var(--space-md)' }}
                >
                  Create New Student
                </button>
              </div>
              <div className="welcome-message">
                <p>Welcome to your student portal! Use the sidebar to navigate to different sections.</p>
              </div>
            </div>
          )}
          {activeTab !== 'overview' && renderTabContent()}
        </main>
      </div>

      {/* Create Student Modal */}
      {showCreateStudent && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setShowCreateStudent(false)}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Add New Student</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setShowCreateStudent(false)}>✕</button>
            </div>
            <div className="modal__content">
              <form onSubmit={handleCreateStudent} className="student-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="given_name">Given Name *</label>
                    <input
                      type="text"
                      id="given_name"
                      name="given_name"
                      value={studentForm.given_name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="middle_name">Middle Name</label>
                    <input
                      type="text"
                      id="middle_name"
                      name="middle_name"
                      value={studentForm.middle_name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="surname">Surname *</label>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      value={studentForm.surname}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth *</label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={studentForm.date_of_birth}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender">Gender *</label>
                    <select
                      id="gender"
                      name="gender"
                      value={studentForm.gender}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="enrollment_date">Enrollment Date *</label>
                    <input
                      type="date"
                      id="enrollment_date"
                      name="enrollment_date"
                      value={studentForm.enrollment_date}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateStudent(false)} 
                    className="btn btn--secondary" 
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !studentForm.given_name || !studentForm.surname || !studentForm.date_of_birth || !studentForm.gender || !studentForm.enrollment_date} 
                    className="btn btn--primary"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
