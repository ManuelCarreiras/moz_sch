import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface StudentClassEnrollmentProps {
  onBack: () => void;
}

interface Student {
  _id: string;
  given_name: string;
  middle_name?: string;
  surname: string;
}

interface Class {
  _id: string;
  class_name: string;
  subject_name?: string;
  teacher_name?: string;
}

interface StudentClass {
  _id: string;
  student_id: string;
  class_id: string;
  score: number;
}

export function StudentClassEnrollment({ onBack }: StudentClassEnrollmentProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<StudentClass | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    score: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsResponse, classesResponse, enrollmentsResponse] = await Promise.all([
        apiService.get('/student'),
        apiService.getClasses(),
        apiService.getStudentClasses()
      ]);

      if (studentsResponse.success) {
        const studentData = (studentsResponse.data as any)?.message || studentsResponse.data;
        setStudents(Array.isArray(studentData) ? studentData : []);
      }

      if (classesResponse.success) {
        const classData = (classesResponse.data as any)?.message || classesResponse.data;
        setClasses(Array.isArray(classData) ? classData : []);
      }

      if (enrollmentsResponse.success) {
        const enrollmentData = (enrollmentsResponse.data as any)?.message || enrollmentsResponse.data;
        setStudentClasses(Array.isArray(enrollmentData) ? enrollmentData : []);
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.class_id) {
      setError('Please select a student and class');
      return;
    }

    try {
      setError(null);
      
      if (editingEnrollment) {
        // Update existing enrollment
        const response = await apiService.updateStudentClass(editingEnrollment._id, {
          ...formData,
          score: parseFloat(formData.score) || 0
        });
        
        if (response.success) {
          alert('Enrollment updated successfully!');
          setShowForm(false);
          setEditingEnrollment(null);
          setFormData({ student_id: '', class_id: '', score: '' });
          loadData();
        } else {
          setError('Failed to update enrollment');
        }
      } else {
        // Create new enrollment - only send student_id and class_id, score is optional
        const enrollmentData: any = {
          student_id: formData.student_id,
          class_id: formData.class_id
        };
        // Only include score if it's provided
        if (formData.score) {
          enrollmentData.score = parseFloat(formData.score);
        }
        const response = await apiService.createStudentClass(enrollmentData);
        
        if (response.success) {
          alert('Student enrolled successfully!');
          setShowForm(false);
          setFormData({ student_id: '', class_id: '', score: '' });
          loadData();
        } else {
          setError('Failed to enroll student');
        }
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error submitting enrollment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;
    
    try {
      const response = await apiService.deleteStudentClass(id);
      
      if (response.success) {
        alert('Enrollment removed successfully!');
        loadData();
      } else {
        setError('Failed to remove enrollment');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting enrollment:', err);
    }
  };

  const handleEdit = (enrollment: StudentClass) => {
    setEditingEnrollment(enrollment);
    setFormData({
      student_id: enrollment.student_id,
      class_id: enrollment.class_id,
      score: enrollment.score.toString()
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEnrollment(null);
    setFormData({ student_id: '', class_id: '', score: '' });
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student ? `${student.given_name} ${student.surname}` : 'Unknown';
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c._id === classId);
    return classItem ? classItem.class_name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p>Loading enrollment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn--secondary" onClick={onBack}>
          ← Back to Classes
        </button>
        <div>
          <h2>Student Class Enrollment</h2>
          <p>Manage student enrollments and scores for classes.</p>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {!showForm ? (
        <div>
          <div className="table-header">
            <button 
              className="btn btn--primary"
              onClick={() => setShowForm(true)}
            >
              Enroll Student in Class
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentClasses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No enrollments found. Click "Enroll Student in Class" to get started.
                    </td>
                  </tr>
                ) : (
                  studentClasses.map((enrollment) => (
                    <tr key={enrollment._id}>
                      <td>{getStudentName(enrollment.student_id)}</td>
                      <td>{getClassName(enrollment.class_id)}</td>
                      <td>{enrollment.score}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn--small btn--primary"
                            onClick={() => handleEdit(enrollment)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn--small btn--danger"
                            onClick={() => handleDelete(enrollment._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="modal" role="dialog" aria-modal="true" onClick={handleCancel}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editingEnrollment ? 'Edit Enrollment' : 'Enroll Student in Class'}</h2>
              <button className="icon-btn" aria-label="Close" onClick={handleCancel}>✕</button>
            </div>

            <div className="modal__content">
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                  <label htmlFor="student_id">Student *</label>
                  <select
                    id="student_id"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.given_name} {student.surname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="class_id">Class *</label>
                  <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((classItem) => (
                      <option key={classItem._id} value={classItem._id}>
                        {classItem.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                {editingEnrollment && (
                  <div className="form-group">
                    <label htmlFor="score">Score</label>
                    <input
                      type="number"
                      id="score"
                      name="score"
                      value={formData.score}
                      onChange={handleInputChange}
                      placeholder="Enter score (0-100)"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                )}

                <div className="form-actions" style={{ marginTop: 'var(--space-lg)' }}>
                  <button type="submit" className="btn btn--primary">
                    {editingEnrollment ? 'Update Enrollment' : 'Enroll Student'}
                  </button>
                  <button type="button" className="btn btn--secondary" onClick={handleCancel}>
                    Cancel
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

