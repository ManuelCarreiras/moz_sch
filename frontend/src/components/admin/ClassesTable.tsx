import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

export interface Class {
  _id: string;
  subject_id: string;
  teacher_id: string;
  term_id: string;
  period_id: string;
  classroom_id: string;
  year_level_id: string;
  class_name: string;
  subject_name?: string;
  teacher_name?: string;
  term_number?: number;
  period_name?: string;
  room_name?: string;
  year_level_name?: string;
}

interface Term {
  _id: string;
  year_id: string;
  term_number: number;
  start_date: string;
  end_date: string;
}

interface YearLevel {
  _id: string;
  level_name: string;
  level_order: number;
}

interface ClassesTableProps {
  onNavigateToEnrollments?: () => void;
  onNavigateToTimetable?: () => void;
}

export function ClassesTable({ onNavigateToEnrollments, onNavigateToTimetable }: ClassesTableProps = {}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    term_id: '',
    year_level_id: ''
  });
  
  const [selectedLevelOrder, setSelectedLevelOrder] = useState<string>('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [classesRes, termsRes, yearLevelsRes] = await Promise.all([
        apiService.getClasses(),
        apiService.getTerms(),
        apiService.getYearLevels()
      ]);

      if (classesRes.success) {
        const classesData = (classesRes.data as any)?.message || classesRes.data;
        setClasses(Array.isArray(classesData) ? classesData : []);
      }

      if (termsRes.success) {
        const termsData = (termsRes.data as any)?.message || termsRes.data;
        setTerms(Array.isArray(termsData) ? termsData : []);
      }

      if (yearLevelsRes.success) {
        const yearLevelsData = (yearLevelsRes.data as any)?.message || yearLevelsRes.data;
        setYearLevels(Array.isArray(yearLevelsData) ? yearLevelsData : []);
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Generate class name from year level
      const selectedYearLevel = yearLevels.find(yl => yl._id === formData.year_level_id);
      if (!selectedYearLevel) {
        setError('Please select a year level');
        return;
      }
      
      const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
      const gradeName = gradeNames[selectedYearLevel.level_order] || `${selectedYearLevel.level_order}th`;
      const class_name = `${gradeName} ${selectedYearLevel.level_name}`;
      
      const classData = {
        ...formData,
        class_name: class_name,
        subject_id: '',  // Will be assigned in timetable
        teacher_id: '',  // Will be assigned later
        period_id: '',   // Will be assigned in timetable
        classroom_id: '' // Will be assigned later
      };
      
      const response = await apiService.createClass(classData);
      
      if (response.success) {
        alert('Class created successfully!');
        setShowModal(false);
        setFormData({
          term_id: '',
          year_level_id: ''
        });
        fetchAllData();
      } else {
        setError(response.error || 'Failed to create class');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating class:', err);
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      term_id: classItem.term_id,
      year_level_id: classItem.year_level_id
    });
    // Find and set the level order for editing
    const yearLevel = yearLevels.find(y => y._id === classItem.year_level_id);
    if (yearLevel) {
      setSelectedLevelOrder(yearLevel.level_order.toString());
    }
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editingClass) return;
    
    try {
      const response = await apiService.updateClass(editingClass._id, formData);
      
      if (response.success) {
        alert('Class updated successfully!');
        setShowModal(false);
        setEditingClass(null);
        setFormData({
          term_id: '',
          year_level_id: ''
        });
        fetchAllData();
      } else {
        setError(response.error || 'Failed to update class');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error updating class:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const response = await apiService.deleteClass(id);
      
      if (response.success) {
        alert('Class deleted successfully!');
        fetchAllData();
      } else {
        setError(response.error || 'Failed to delete class');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting class:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      handleUpdate();
    } else {
      handleCreate();
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
          <h3>Class Management</h3>
          <p className="table-description">Create and manage classes with subject, teacher, term, period, and classroom assignments.</p>
        </div>
        <div className="table-header__actions" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {onNavigateToEnrollments && (
            <button 
              className="btn btn--secondary"
              onClick={onNavigateToEnrollments}
            >
              Manage Enrollments
            </button>
          )}
          {onNavigateToTimetable && (
            <button 
              className="btn btn--secondary"
              onClick={onNavigateToTimetable}
            >
              View Timetables
            </button>
          )}
          <button 
            className="btn btn--primary"
              onClick={() => {
                setEditingClass(null);
                setFormData({
                  term_id: '',
                  year_level_id: ''
                });
                setSelectedLevelOrder('');
                setShowModal(true);
              }}
          >
            Add New Class
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Term</th>
              <th>Period</th>
              <th>Classroom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  No classes found. Click "Add New Class" to create one.
                </td>
              </tr>
            ) : (
              classes.map((classItem) => (
                <tr key={classItem._id}>
                  <td><strong>{classItem.class_name}</strong></td>
                  <td>{classItem.subject_name || 'N/A'}</td>
                  <td>{classItem.teacher_name || 'N/A'}</td>
                  <td>Term {classItem.term_number || 'N/A'}</td>
                  <td>{classItem.period_name || 'N/A'}</td>
                  <td>{classItem.room_name || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(classItem)}
                        className="btn btn--small btn--secondary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(classItem._id)}
                        className="btn btn--small btn--danger"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal__overlay">
            <div className="modal__dialog">
              <div className="modal__header">
                <h3>{editingClass ? 'Edit Class' : 'Add New Class'}</h3>
                <button 
                  className="modal__close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClass(null);
                    setSelectedLevelOrder('');
                    setFormData({
                      term_id: '',
                      year_level_id: ''
                    });
                  }}
                >
                  ×
                </button>
              </div>
              <div className="modal__content">
                <form onSubmit={handleSubmit} className="student-form">
                  <div className="form-group">
                    <label htmlFor="term">Term *</label>
                    <select
                      id="term"
                      value={formData.term_id}
                      onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
                      required
                    >
                      <option value="">Select a term</option>
                      {terms.map((term) => (
                        <option key={term._id} value={term._id}>
                          Term {term.term_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="level_order">Grade/Year *</label>
                    <select
                      id="level_order"
                      value={selectedLevelOrder}
                      onChange={(e) => {
                        setSelectedLevelOrder(e.target.value);
                        setFormData({ ...formData, year_level_id: '' }); // Reset year level selection
                      }}
                      required
                    >
                      <option value="">Select grade/year</option>
                      {[...new Set(yearLevels.map(y => y.level_order))].sort().map((order) => (
                        <option key={order} value={order}>
                          Grade {order}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedLevelOrder && (
                    <div className="form-group">
                      <label htmlFor="year_level">Section (A, B, C...) *</label>
                      <select
                        id="year_level"
                        value={formData.year_level_id}
                        onChange={(e) => setFormData({ ...formData, year_level_id: e.target.value })}
                        required
                      >
                        <option value="">Select a section</option>
                        {yearLevels
                          .filter(y => y.level_order === parseInt(selectedLevelOrder))
                          .map((yearLevel) => (
                            <option key={yearLevel._id} value={yearLevel._id}>
                              {yearLevel.level_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editingClass ? 'Update Class' : 'Create Class'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        setEditingClass(null);
                        setSelectedLevelOrder('');
                        setFormData({
                          term_id: '',
                          year_level_id: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}