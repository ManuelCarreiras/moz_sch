import { useState } from 'react';
import { useAuth, useUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSrc from '../assets/Santa_Isabel.png';
import watermarkSrc from '../assets/Escola_marca_de_água.png';

export function StudentDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
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
              Student: {user.email}
            </span>
            <button className="btn btn--small" onClick={handleSignOut}>
              Sign Out
            </button>
          </nav>
        </header>

        <main className="hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h1>Student Portal</h1>
              <p className="hero__subtitle">Access your academic information, grades, and schedule.</p>
            </div>
            <button 
              className="btn btn--primary"
              onClick={() => setShowCreateStudent(true)}
              style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-sm) var(--space-md)' }}
            >
              Create New Student
            </button>
          </div>
          
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
              <div className="feature">
                <h3>My Grades</h3>
                <p>View your academic grades and performance across all subjects.</p>
                <button className="btn btn--small btn--primary">View Grades</button>
              </div>
              <div className="feature">
                <h3>Schedule</h3>
                <p>Check your class schedule and upcoming assignments.</p>
                <button className="btn btn--small btn--primary">View Schedule</button>
              </div>
              <div className="feature">
                <h3>Profile</h3>
                <p>Update your personal information and contact details.</p>
                <button className="btn btn--small btn--primary">Edit Profile</button>
              </div>
              <div className="feature">
                <h3>Resources</h3>
                <p>Access learning materials and educational resources.</p>
                <button className="btn btn--small btn--primary">Access Resources</button>
              </div>
              <div className="feature">
                <h3>Attendance</h3>
                <p>View your attendance records and absences.</p>
                <button className="btn btn--small btn--primary">View Attendance</button>
              </div>
              <div className="feature">
                <h3>Assignments</h3>
                <p>Track your homework and project deadlines.</p>
                <button className="btn btn--small btn--primary">View Assignments</button>
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <span>© Santa Isabel Escola - Student Portal</span>
        </footer>
      </div>

      {/* Create Student Modal */}
      {showCreateStudent && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-student-title" onClick={() => setShowCreateStudent(false)}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 id="create-student-title">Create New Student</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setShowCreateStudent(false)}>✕</button>
            </div>
            <div className="modal__content">
              <form onSubmit={handleCreateStudent}>
                <div className="form-group">
                  <label htmlFor="given_name">Given Name *</label>
                  <input
                    id="given_name"
                    name="given_name"
                    type="text"
                    value={studentForm.given_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter given name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="middle_name">Middle Name *</label>
                  <input
                    id="middle_name"
                    name="middle_name"
                    type="text"
                    value={studentForm.middle_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter middle name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="surname">Surname *</label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    value={studentForm.surname}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter surname"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth *</label>
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={studentForm.date_of_birth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={studentForm.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="enrollment_date">Enrollment Date *</label>
                  <input
                    id="enrollment_date"
                    name="enrollment_date"
                    type="date"
                    value={studentForm.enrollment_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowCreateStudent(false)}
                    style={{ marginRight: 'var(--space-sm)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
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
    </>
  );
}
