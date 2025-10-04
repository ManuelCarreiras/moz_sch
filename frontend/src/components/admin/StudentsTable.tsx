import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  address: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
}

export function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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

  const handleCreateStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const response = await apiService.createStudent(studentData);
      if (response.success) {
        await loadStudents(); // Reload the list
        setShowForm(false);
      } else {
        setError(response.error || 'Failed to create student');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating student:', err);
    }
  };

  const handleUpdateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const response = await apiService.updateStudent(id, studentData);
      if (response.success) {
        await loadStudents(); // Reload the list
        setEditingStudent(null);
      } else {
        setError(response.error || 'Failed to update student');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error updating student:', err);
    }
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
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            onClick={() => setShowForm(true)}
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
                      <strong>{student.first_name} {student.last_name}</strong>
                      <span className="student-gender">
                        {student.gender === 'M' ? '♂' : '♀'}
                      </span>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{new Date(student.date_of_birth).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-badge--${student.status}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn--small btn--secondary"
                        onClick={() => setEditingStudent(student)}
                        title="Edit student"
                      >
                        Edit
                      </button>
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

      {/* Student Form Modal */}
      {(showForm || editingStudent) && (
        <StudentForm
          student={editingStudent}
          onSave={editingStudent ? 
            (data) => handleUpdateStudent(editingStudent.id, data) :
            handleCreateStudent
          }
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
}

// Student Form Component
interface StudentFormProps {
  student?: Student | null;
  onSave: (data: Omit<Student, 'id'>) => void;
  onCancel: () => void;
}

function StudentForm({ student, onSave, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    date_of_birth: student?.date_of_birth || '',
    gender: student?.gender || 'M' as 'M' | 'F',
    address: student?.address || '',
    enrollment_date: student?.enrollment_date || new Date().toISOString().split('T')[0],
    status: student?.status || 'active' as 'active' | 'inactive' | 'graduated',
    guardian_name: student?.guardian_name || '',
    guardian_phone: student?.guardian_phone || '',
    guardian_email: student?.guardian_email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal" onClick={onCancel}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{student ? 'Edit Student' : 'Add New Student'}</h3>
          <button className="icon-btn" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="enrollment_date">Enrollment Date *</label>
              <input
                type="date"
                id="enrollment_date"
                name="enrollment_date"
                value={formData.enrollment_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>Guardian Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="guardian_name">Guardian Name</label>
                <input
                  type="text"
                  id="guardian_name"
                  name="guardian_name"
                  value={formData.guardian_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="guardian_phone">Guardian Phone</label>
                <input
                  type="tel"
                  id="guardian_phone"
                  name="guardian_phone"
                  value={formData.guardian_phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="guardian_email">Guardian Email</label>
              <input
                type="email"
                id="guardian_email"
                name="guardian_email"
                value={formData.guardian_email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {student ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
