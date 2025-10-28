import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

export interface Class {
  _id: string;
  subject_id: string;
  teacher_id: string;
  term_id: string;
  period_id: string;
  classroom_id: string;
  class_name: string;
  subject_name?: string;
  teacher_name?: string;
  term_number?: number;
  period_name?: string;
  room_name?: string;
}

interface Subject {
  _id: string;
  subject_name: string;
  department_id: string;
}

interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
}

interface Term {
  _id: string;
  year_id: string;
  term_number: number;
  start_date: string;
  end_date: string;
}

interface Period {
  _id: string;
  year_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface Classroom {
  _id: string;
  room_name: string;
  room_type: string;
  capacity: number;
}

export function ClassesTable() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    teacher_id: '',
    term_id: '',
    period_id: '',
    classroom_id: '',
    class_name: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [classesRes, subjectsRes, teachersRes, termsRes, periodsRes, classroomsRes] = await Promise.all([
        apiService.getClasses(),
        apiService.getSubjects(),
        apiService.getTeachers(),
        apiService.getTerms(),
        apiService.getPeriods(),
        apiService.getClassrooms()
      ]);

      if (classesRes.success) {
        const classesData = (classesRes.data as any)?.message || classesRes.data;
        setClasses(Array.isArray(classesData) ? classesData : []);
      }

      if (subjectsRes.success) {
        const subjectsData = (subjectsRes.data as any)?.message || subjectsRes.data;
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      }

      if (teachersRes.success) {
        const teachersData = (teachersRes.data as any)?.message || teachersRes.data;
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      }

      if (termsRes.success) {
        const termsData = (termsRes.data as any)?.message || termsRes.data;
        setTerms(Array.isArray(termsData) ? termsData : []);
      }

      if (periodsRes.success) {
        const periodsData = (periodsRes.data as any)?.message || periodsRes.data;
        setPeriods(Array.isArray(periodsData) ? periodsData : []);
      }

      if (classroomsRes.success) {
        const classroomsData = (classroomsRes.data as any)?.message || classroomsRes.data;
        setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
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
      const response = await apiService.createClass(formData);
      
      if (response.success) {
        alert('Class created successfully!');
        setShowModal(false);
        setFormData({
          subject_id: '',
          teacher_id: '',
          term_id: '',
          period_id: '',
          classroom_id: '',
          class_name: ''
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
      subject_id: classItem.subject_id,
      teacher_id: classItem.teacher_id,
      term_id: classItem.term_id,
      period_id: classItem.period_id,
      classroom_id: classItem.classroom_id,
      class_name: classItem.class_name
    });
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
          subject_id: '',
          teacher_id: '',
          term_id: '',
          period_id: '',
          classroom_id: '',
          class_name: ''
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
        <div className="table-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => {
              setEditingClass(null);
              setFormData({
                subject_id: '',
                teacher_id: '',
                term_id: '',
                period_id: '',
                classroom_id: '',
                class_name: ''
              });
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
              <div className="modal__content">
                <div className="modal__header">
                  <h3>{editingClass ? 'Edit Class' : 'Add New Class'}</h3>
                  <button 
                    className="modal__close"
                    onClick={() => {
                      setShowModal(false);
                      setEditingClass(null);
                      setFormData({
                        subject_id: '',
                        teacher_id: '',
                        term_id: '',
                        period_id: '',
                        classroom_id: '',
                        class_name: ''
                      });
                    }}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="student-form">
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="teacher">Teacher *</label>
                    <select
                      id="teacher"
                      value={formData.teacher_id}
                      onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      required
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.given_name} {teacher.surname}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    <label htmlFor="period">Period *</label>
                    <select
                      id="period"
                      value={formData.period_id}
                      onChange={(e) => setFormData({ ...formData, period_id: e.target.value })}
                      required
                    >
                      <option value="">Select a period</option>
                      {periods.map((period) => (
                        <option key={period._id} value={period._id}>
                          {period.name} ({period.start_time} - {period.end_time})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="classroom">Classroom *</label>
                    <select
                      id="classroom"
                      value={formData.classroom_id}
                      onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                      required
                    >
                      <option value="">Select a classroom</option>
                      {classrooms.map((classroom) => (
                        <option key={classroom._id} value={classroom._id}>
                          {classroom.room_name} ({classroom.capacity} seats)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="className">Class Name *</label>
                    <input
                      type="text"
                      id="className"
                      value={formData.class_name}
                      onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                      placeholder="e.g., Math 101 - Section A"
                      required
                    />
                  </div>

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
                        setFormData({
                          subject_id: '',
                          teacher_id: '',
                          term_id: '',
                          period_id: '',
                          classroom_id: '',
                          class_name: ''
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