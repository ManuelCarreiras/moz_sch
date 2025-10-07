import { useState } from 'react';
import { useAuth, useUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSrc from '../assets/Santa_Isabel.png';
import watermarkSrc from '../assets/Escola_marca_de_água.png';
import { TeacherWizard } from './admin/TeacherWizard';

export function TeacherDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);

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

  return (
    <>
      <div className="watermark" style={{ backgroundImage: `url(${watermarkSrc})` }}></div>
      <div className="landing">
        <header className="landing__header">
          <div className="brand">
            <img className="brand__logo" src={logoSrc} alt="Santa Isabel Escola" loading="eager" />
            <span className="brand__name">Santa Isabel Escola</span>
          </div>
          <nav className="nav">
            <button 
              className="btn btn--small" 
              onClick={() => navigate('/dashboard')}
              style={{ marginRight: 'var(--space-sm)' }}
            >
              Back to Dashboard
            </button>
            <span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
              Teacher: {user.email}
            </span>
            <button className="btn btn--small" onClick={handleSignOut}>
              Sign Out
            </button>
          </nav>
        </header>

        <main className="hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h1>Teacher Portal</h1>
              <p className="hero__subtitle">Manage your classes, students, and teaching resources.</p>
            </div>
            <button 
              className="btn btn--primary"
              onClick={() => setShowCreateTeacher(true)}
            >
              Create New Teacher
            </button>
          </div>
          
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="feature">
                <h3>My Classes</h3>
                <p>View your assigned classes and teaching schedule.</p>
                <button className="btn btn--small btn--primary">View Classes</button>
              </div>
              <div className="feature">
                <h3>Students</h3>
                <p>Access student information and track academic progress.</p>
                <button className="btn btn--small btn--primary">View Students</button>
              </div>
              <div className="feature">
                <h3>Grades</h3>
                <p>Enter and manage student grades and assessments.</p>
                <button className="btn btn--small btn--primary">Manage Grades</button>
              </div>
              <div className="feature">
                <h3>Resources</h3>
                <p>Access teaching materials and educational resources.</p>
                <button className="btn btn--small btn--primary">Access Resources</button>
              </div>
              <div className="feature">
                <h3>Attendance</h3>
                <p>Mark student attendance and view attendance records.</p>
                <button className="btn btn--small btn--primary">Mark Attendance</button>
              </div>
              <div className="feature">
                <h3>Assignments</h3>
                <p>Create and manage homework and project assignments.</p>
                <button className="btn btn--small btn--primary">Manage Assignments</button>
              </div>
              <div className="feature">
                <h3>Reports</h3>
                <p>Generate academic reports and performance analytics.</p>
                <button className="btn btn--small btn--primary">View Reports</button>
              </div>
              <div className="feature">
                <h3>Profile</h3>
                <p>Update your personal information and teaching preferences.</p>
                <button className="btn btn--small btn--primary">Edit Profile</button>
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <span>© Santa Isabel Escola - Teacher Portal</span>
        </footer>
      </div>

      {showCreateTeacher && (
        <TeacherWizard
          onClose={() => setShowCreateTeacher(false)}
          onSuccess={handleTeacherCreated}
        />
      )}
    </>
  );
}
