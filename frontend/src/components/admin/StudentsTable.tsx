import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { StudentWizard } from './StudentWizard';

export interface Student {
  id: string;
  given_name: string;
  middle_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  address: string;
  enrolment_date: string;
  status: 'active' | 'inactive' | 'graduated';
}

export function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStudents();
      
      if (response.success && response.data) {
        setStudents(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error || 'Failed to load students');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCreated = () => {
    loadStudents(); // Reload the list
    setShowWizard(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await apiService.deleteStudent(id);
      if (response.success) {
        await loadStudents(); // Reload the list
      } else {
        setError(response.error || 'Failed to delete student');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting student:', err);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    `${student.given_name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

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
        Loading students...
      </div>
    );
  }

  return (
    <div className="students-table">
      {/* Header */}
      <div className="table-header">
        <div className="table-header__title">
          <h2>Student Management</h2>
          <p>Manage student records, enrollment, and academic progress</p>
        </div>
        <div className="table-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowWizard(true)}
          >
            Add New Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="table-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="table-stats">
          <span>Total: {filteredStudents.length} students</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date of Birth</th>
              <th>Status</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-name">
                      <strong>{student.given_name} {student.surname}</strong>
                      <span className="student-gender">
                        {student.gender === 'Male' ? '♂' : '♀'}
                      </span>
                    </div>
                  </td>
                  <td>{student.email_address}</td>
                  <td>{student.phone_number}</td>
                  <td>{new Date(student.date_of_birth).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-badge--${student.status}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>{new Date(student.enrolment_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn--small btn--danger"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Delete student"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--small"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn--small"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Student Wizard Modal */}
      {showWizard && (
        <StudentWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleStudentCreated}
        />
      )}
    </div>
  );
}
