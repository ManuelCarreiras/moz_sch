import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface StudentYearLevelAssignmentProps {
  onBack: () => void;
}

interface Student {
  _id: string;
  given_name: string;
  middle_name?: string;
  surname: string;
}

interface YearLevel {
  _id: string;
  level_name: string;
  level_order: number;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

interface StudentYearLevel {
  _id: string;
  student_id: string;
  level_id: string;
  year_id: string;
  score: number;
}

export function StudentYearLevelAssignment({ onBack }: StudentYearLevelAssignmentProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [studentYearLevels, setStudentYearLevels] = useState<StudentYearLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<StudentYearLevel | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    level_id: '',
    year_id: '',
    score: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsResponse, yearLevelsResponse, schoolYearsResponse, assignmentsResponse] = await Promise.all([
        apiService.get('/student'),
        apiService.getYearLevels(),
        apiService.getSchoolYears(),
        apiService.get('/student-year-level')
      ]);

      if (studentsResponse.success) {
        const studentData = (studentsResponse.data as any)?.message || studentsResponse.data;
        setStudents(Array.isArray(studentData) ? studentData : []);
      }

      if (yearLevelsResponse.success) {
        const yearLevelData = (yearLevelsResponse.data as any)?.message || yearLevelsResponse.data;
        setYearLevels(Array.isArray(yearLevelData) ? yearLevelData : []);
      }

      if (schoolYearsResponse.success) {
        const schoolYearData = (schoolYearsResponse.data as any)?.message || schoolYearsResponse.data;
        setSchoolYears(Array.isArray(schoolYearData) ? schoolYearData : []);
      }

      if (assignmentsResponse.success) {
        const assignmentData = (assignmentsResponse.data as any)?.message || assignmentsResponse.data;
        setStudentYearLevels(Array.isArray(assignmentData) ? assignmentData : []);
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
    
    if (!formData.student_id || !formData.level_id || !formData.year_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const submitData = {
        student_id: formData.student_id,
        level_id: formData.level_id,
        year_id: formData.year_id,
        score: formData.score ? parseFloat(formData.score) : 0
      };

      if (editingAssignment) {
        await apiService.updateStudentYearLevel(editingAssignment._id, submitData);
        alert('Student assignment updated successfully!');
      } else {
        await apiService.createStudentYearLevel(submitData);
        alert('Student assigned to year level successfully!');
      }

      setShowForm(false);
      setEditingAssignment(null);
      setFormData({ student_id: '', level_id: '', year_id: '', score: '' });
      loadData();
    } catch (err) {
      console.error('Error saving student assignment:', err);
      alert('Failed to save student assignment');
    }
  };

  const handleEdit = (assignment: StudentYearLevel) => {
    setEditingAssignment(assignment);
    setFormData({
      student_id: assignment.student_id,
      level_id: assignment.level_id,
      year_id: assignment.year_id,
      score: assignment.score.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student assignment?')) {
      return;
    }

    try {
      await apiService.deleteStudentYearLevel(id);
      alert('Student assignment deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Error deleting student assignment:', err);
      alert('Failed to delete student assignment');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAssignment(null);
    setFormData({ student_id: '', level_id: '', year_id: '', score: '' });
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student ? `${student.given_name} ${student.surname}` : 'Unknown Student';
  };

  const getYearLevelDisplay = (levelId: string) => {
    const yearLevel = yearLevels.find(yl => yl._id === levelId);
    if (!yearLevel) return 'Unknown Level';
    
    const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
    const gradeName = gradeNames[yearLevel.level_order] || `${yearLevel.level_order}th`;
    
    return `${gradeName} ${yearLevel.level_name}`;
  };

  const getSchoolYearName = (yearId: string) => {
    const schoolYear = schoolYears.find(sy => sy._id === yearId);
    return schoolYear ? schoolYear.year_name : 'Unknown Year';
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          Loading student assignments...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button onClick={onBack} className="btn btn--secondary">
          ← Back to School Year Management
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2>Student Year Level Assignment</h2>
          <p className="table-description">
            Assign students to year levels and school years. Format: Grade + Level (e.g., "1st A", "2nd B").
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn--primary"
          disabled={yearLevels.length === 0 || schoolYears.length === 0}
        >
          Assign Student
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {/* Setup Requirements */}
      {(yearLevels.length === 0 || schoolYears.length === 0) && (
        <div style={{ 
          marginBottom: 'var(--space-lg)', 
          padding: 'var(--space-md)', 
          backgroundColor: 'var(--warning-light)', 
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--warning)'
        }}>
          <h4 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--warning-dark)' }}>
            ⚠️ Setup Required
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Before assigning students, please create:
          </p>
          <ul style={{ margin: 'var(--space-xs) 0 0 0', paddingLeft: 'var(--space-lg)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {yearLevels.length === 0 && <li>At least one <strong>Year Level</strong> (e.g., Grade A, 1st Grade)</li>}
            {schoolYears.length === 0 && <li>At least one <strong>School Year</strong> (e.g., 2026)</li>}
          </ul>
        </div>
      )}

      {showForm && (
        <div className="modal" role="dialog" aria-modal="true" onClick={handleCancel}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editingAssignment ? 'Edit Student Assignment' : 'Assign Student to Year Level'}</h2>
              <button onClick={handleCancel} className="icon-btn" aria-label="Close">✕</button>
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
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.given_name} {student.surname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="year_id">School Year *</label>
                  <select
                    id="year_id"
                    name="year_id"
                    value={formData.year_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select School Year</option>
                    {schoolYears.map((schoolYear) => (
                      <option key={schoolYear._id} value={schoolYear._id}>
                        {schoolYear.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="level_id">Year Level *</label>
                  <select
                    id="level_id"
                    name="level_id"
                    value={formData.level_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Year Level</option>
                    {yearLevels
                      .sort((a, b) => a.level_order - b.level_order)
                      .map((yearLevel) => {
                        const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
                        const gradeName = gradeNames[yearLevel.level_order] || `${yearLevel.level_order}th`;
                        const displayName = `${gradeName} ${yearLevel.level_name}`;
                        
                        return (
                          <option key={yearLevel._id} value={yearLevel._id}>
                            {displayName}
                          </option>
                        );
                      })}
                  </select>
                  <small style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    Format: Grade + Level (e.g., "1st A", "2nd B")
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="score">Score (Optional)</label>
                  <input
                    type="number"
                    id="score"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g., 85.5"
                  />
                  <small style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    Leave empty for basic assignment without score
                  </small>
                </div>

              <div className="form-actions" style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  {editingAssignment ? 'Update' : 'Assign'} Student
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {studentYearLevels.length === 0 ? (
        <div className="no-data">
          <p>No student assignments found. Assign students to year levels to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>School Year</th>
                <th>Year Level</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentYearLevels.map((assignment) => (
                <tr key={assignment._id}>
                  <td>{getStudentName(assignment.student_id)}</td>
                  <td>{getSchoolYearName(assignment.year_id)}</td>
                  <td>{getYearLevelDisplay(assignment.level_id)}</td>
                  <td>{assignment.score || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="btn btn--primary btn--sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="btn btn--danger btn--sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}