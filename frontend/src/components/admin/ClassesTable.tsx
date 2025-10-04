import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Class {
  id: string;
  name: string;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  classroom_id?: string;
  classroom_name?: string;
  year_level_id: string;
  year_level_name?: string;
  term_id: string;
  term_name?: string;
  school_year_id: string;
  school_year_name?: string;
  schedule: string;
  max_students: number;
  current_students: number;
  status: 'active' | 'inactive';
}

export function ClassesTable() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClasses();
      
      if (response.success && response.data) {
        setClasses(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error || 'Failed to load classes');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading classes:', err);
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
        Loading classes...
      </div>
    );
  }

  return (
    <div className="classes-table">
      <div className="table-header">
        <div className="table-header__title">
          <h2>Class Management</h2>
          <p>Create and manage class schedules, subjects, and classroom assignments</p>
        </div>
        <div className="table-header__actions">
          <button className="btn btn--primary">
            Add New Class
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
              <th>Class Name</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Classroom</th>
              <th>Year Level</th>
              <th>Schedule</th>
              <th>Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">
                  No classes found.
                </td>
              </tr>
            ) : (
              classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>
                    <strong>{classItem.name}</strong>
                  </td>
                  <td>{classItem.subject_name || 'N/A'}</td>
                  <td>{classItem.teacher_name || 'N/A'}</td>
                  <td>{classItem.classroom_name || 'N/A'}</td>
                  <td>{classItem.year_level_name || 'N/A'}</td>
                  <td>{classItem.schedule}</td>
                  <td>
                    <span className="student-count">
                      {classItem.current_students}/{classItem.max_students}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${classItem.status}`}>
                      {classItem.status}
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
