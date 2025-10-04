import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  address: string;
  hire_date: string;
  status: 'active' | 'inactive';
  department_id?: string;
  department_name?: string;
  subjects?: string[];
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
        setTeachers(Array.isArray(response.data) ? response.data : []);
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
              <th>Department</th>
              <th>Hire Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="teacher-name">
                      <strong>{teacher.first_name} {teacher.last_name}</strong>
                      <span className="teacher-gender">
                        {teacher.gender === 'M' ? '♂' : '♀'}
                      </span>
                    </div>
                  </td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.department_name || 'N/A'}</td>
                  <td>{new Date(teacher.hire_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-badge--${teacher.status}`}>
                      {teacher.status}
                    </span>
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
