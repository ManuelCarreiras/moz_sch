import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
  gender: string;
}

export function TeachersTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeachers();
      
      if (response.success && response.data) {
        // The backend returns { success: true, message: [...] } format
        const teacherData = (response.data as any).message || response.data;
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } else {
        setError(response.error || 'Failed to load teachers');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Loading teachers...
      </div>
    );
  }

  return (
    <div className="teachers-table">
      <div className="table-header">
        <div className="table-header__title">
          <h2>Teacher Management</h2>
          <p>Manage teacher profiles, assignments, and department information</p>
        </div>
        <div className="table-header__actions">
          <button className="btn btn--primary">
            Add New Teacher
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>
                    <div className="teacher-name">
                      <strong>{teacher.given_name} {teacher.surname}</strong>
                    </div>
                  </td>
                  <td>{teacher.email_address}</td>
                  <td>{teacher.phone_number}</td>
                  <td>
                    <span className="teacher-gender">
                      {teacher.gender === 'Male' ? '♂' : teacher.gender === 'Female' ? '♀' : '⚧'}
                    </span>
                    {teacher.gender}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn--small btn--secondary">Edit</button>
                      <button className="btn btn--small btn--danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
