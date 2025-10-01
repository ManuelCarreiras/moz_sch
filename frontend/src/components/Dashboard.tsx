import { useAuth, useUser } from '../contexts/AuthContext';

export function Dashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();

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

  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'admin':
        return 'Welcome to the Admin Portal';
      case 'teacher':
        return 'Welcome to the Teacher Portal';
      case 'student':
        return 'Welcome to the Student Portal';
      default:
        return 'Welcome to the Portal';
    }
  };

  const getPortalContent = () => {
    switch (user.role) {
      case 'admin':
        return (
          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage students, teachers, classes, and school settings.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
              <div className="feature">
                <h3>Students</h3>
                <p>View and manage student records, enrollment, and academic progress.</p>
              </div>
              <div className="feature">
                <h3>Teachers</h3>
                <p>Manage teacher profiles, assignments, and department information.</p>
              </div>
              <div className="feature">
                <h3>Classes</h3>
                <p>Create and manage class schedules, subjects, and classroom assignments.</p>
              </div>
              <div className="feature">
                <h3>Reports</h3>
                <p>Generate academic reports and analytics for school administration.</p>
              </div>
            </div>
          </div>
        );
      case 'teacher':
        return (
          <div>
            <h2>Teacher Dashboard</h2>
            <p>Access your classes, students, and teaching resources.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
              <div className="feature">
                <h3>My Classes</h3>
                <p>View your assigned classes and teaching schedule.</p>
              </div>
              <div className="feature">
                <h3>Students</h3>
                <p>Access student information and track academic progress.</p>
              </div>
              <div className="feature">
                <h3>Grades</h3>
                <p>Enter and manage student grades and assessments.</p>
              </div>
              <div className="feature">
                <h3>Resources</h3>
                <p>Access teaching materials and educational resources.</p>
              </div>
            </div>
          </div>
        );
      case 'student':
        return (
          <div>
            <h2>Student Dashboard</h2>
            <p>View your academic information, grades, and schedule.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
              <div className="feature">
                <h3>My Grades</h3>
                <p>View your academic grades and performance across all subjects.</p>
              </div>
              <div className="feature">
                <h3>Schedule</h3>
                <p>Check your class schedule and upcoming assignments.</p>
              </div>
              <div className="feature">
                <h3>Profile</h3>
                <p>Update your personal information and contact details.</p>
              </div>
              <div className="feature">
                <h3>Resources</h3>
                <p>Access learning materials and educational resources.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Portal content coming soon...</div>;
    }
  };

  return (
    <div className="landing">
      <header className="landing__header">
        <div className="brand">
          <img className="brand__logo" src="/src/assets/Santa_Isabel.png" alt="Santa Isabel Escola" loading="eager" />
          <span className="brand__name">Santa Isabel Escola</span>
        </div>
        <nav className="nav">
          <span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Welcome, {user.email}
          </span>
          <button className="btn btn--small" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      </header>

      <main className="hero">
        <h1>{getWelcomeMessage()}</h1>
        <div style={{ marginTop: 'var(--space-lg)' }}>
          {getPortalContent()}
        </div>
      </main>

      <footer className="footer">
        <span>© Santa Isabel Escola - {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal</span>
      </footer>
    </div>
  );
}
