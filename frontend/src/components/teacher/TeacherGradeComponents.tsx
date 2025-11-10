import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useUser } from '../../contexts/AuthContext';

interface GradeComponent {
  _id: string;
  student_id: string;
  student_name?: string;
  subject_id: string;
  subject_name?: string;
  term_id: string;
  term_number?: number;
  class_id?: string;
  class_name?: string;
  component_type: string;
  component_name: string;
  description?: string;
  score: number;
  max_score: number;
  weight: number;
  notes?: string;
  year_name?: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
}

interface Term {
  _id: string;
  term_number: number;
  year_id: string;
}

interface ClassItem {
  _id: string;
  class_name: string;
  subject_id: string;
  term_id: string;
}

interface Student {
  _id: string;
  given_name: string;
  surname: string;
}

const COMPONENT_TYPES = [
  { value: 'test', label: 'Tests' },
  { value: 'homework', label: 'Homework' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'participation', label: 'Class Participation' },
  { value: 'behavior', label: 'Behavior' },
  { value: 'project', label: 'Project' },
  { value: 'other', label: 'Other' }
];

const TeacherGradeComponents: React.FC = () => {
  const user = useUser();
  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterStudent, setFilterStudent] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    term_id: '',
    class_id: '',
    component_type: 'test',
    component_name: '',
    description: '',
    score: '',
    max_score: '20',
    weight: '',
    notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reset dependent filters
  useEffect(() => {
    setFilterTerm('');
    setFilterSubject('');
    setFilterClass('');
    setFilterStudent('');
  }, [filterYear]);

  useEffect(() => {
    setFilterSubject('');
    setFilterClass('');
    setFilterStudent('');
  }, [filterTerm]);

  useEffect(() => {
    setFilterClass('');
    setFilterStudent('');
  }, [filterSubject]);

  useEffect(() => {
    setFilterStudent('');
  }, [filterClass]);

  // Load components when filters change
  useEffect(() => {
    if (filterYear && filterTerm && filterSubject && filterClass) {
      loadComponents();
      loadStudentsInClass();
    }
  }, [filterYear, filterTerm, filterSubject, filterClass, filterStudent]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load subjects
      const subjectsResp = await apiService.getSubjects();
      if (subjectsResp.success && subjectsResp.data) {
        const subs = (subjectsResp.data as any)?.message || [];
        setSubjects(Array.isArray(subs) ? subs : []);
      }

      // Load school years
      const yearsResp = await apiService.getSchoolYears();
      if (yearsResp.success && yearsResp.data) {
        const years = (yearsResp.data as any)?.message || [];
        setSchoolYears(Array.isArray(years) ? years : []);
      }

      // Load terms
      const termsResp = await apiService.getTerms();
      if (termsResp.success && termsResp.data) {
        const termsData = (termsResp.data as any)?.message || [];
        setTerms(Array.isArray(termsData) ? termsData : []);
      }

      // Load classes
      const classesResp = await apiService.getClasses();
      if (classesResp.success && classesResp.data) {
        const classesData = (classesResp.data as any)?.message || [];
        setClasses(Array.isArray(classesData) ? classesData : []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComponents = async () => {
    try {
      const filters: any = {};
      if (filterTerm) filters.term_id = filterTerm;
      if (filterSubject) filters.subject_id = filterSubject;
      if (filterClass) {
        const selectedClass = getFilteredClasses().find(c => c.class_name === filterClass);
        if (selectedClass) filters.class_id = selectedClass._id;
      }
      if (filterStudent) filters.student_id = filterStudent;

      const response = await apiService.getGradeComponents(filters);
      if (response.success && response.data) {
        const componentsData = (response.data as any)?.grade_components || [];
        setComponents(componentsData);
      }
    } catch (error) {
      console.error('Error loading grade components:', error);
    }
  };

  const loadStudentsInClass = async () => {
    try {
      if (!filterClass) return;
      
      // Get students enrolled in this class
      const selectedClass = getFilteredClasses().find(c => c.class_name === filterClass);
      if (!selectedClass) return;

      const response = await apiService.get(`/student_class?class_id=${selectedClass._id}`);
      if (response.success && response.data) {
        const enrollments = (response.data as any)?.message || [];
        
        // Get unique student IDs
        const studentIds = [...new Set(enrollments.map((e: any) => e.student_id))];
        
        // Fetch student details
        const studentPromises = studentIds.map((id: any) => apiService.getStudent(String(id)));
        const studentResponses = await Promise.all(studentPromises);
        
        const loadedStudents = studentResponses
          .filter(r => r.success && r.data)
          .map(r => (r.data as any)?.message || r.data)
          .filter(s => s);
        
        setStudents(loadedStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const componentData = {
        ...formData,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        weight: parseFloat(formData.weight),
        created_by: user?.id
      };

      const response = await apiService.createGradeComponent(componentData);
      
      if (response.success) {
        alert('Grade component created successfully!');
        setShowAddForm(false);
        resetForm();
        loadComponents();
      } else {
        alert('Error creating grade component: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating grade component:', error);
      alert('Error creating grade component');
    }
  };

  const handleDelete = async (componentId: string) => {
    if (!confirm('Are you sure you want to delete this grade component?')) return;
    
    try {
      const response = await apiService.deleteGradeComponent(componentId);
      if (response.success) {
        alert('Grade component deleted successfully!');
        loadComponents();
      } else {
        alert('Error deleting grade component');
      }
    } catch (error) {
      console.error('Error deleting grade component:', error);
      alert('Error deleting grade component');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      subject_id: '',
      term_id: '',
      class_id: '',
      component_type: 'test',
      component_name: '',
      description: '',
      score: '',
      max_score: '20',
      weight: '',
      notes: ''
    });
  };

  const getFilteredTerms = () => {
    if (!filterYear) return [];
    return terms.filter(t => t.year_id === filterYear);
  };

  const getFilteredSubjects = () => {
    return subjects;
  };

  const getFilteredClasses = () => {
    let filtered = classes;

    if (filterYear) {
      filtered = filtered.filter(cls => {
        const term = terms.find(t => t._id === cls.term_id);
        return term && term.year_id === filterYear;
      });
    }

    if (filterTerm) {
      filtered = filtered.filter(cls => cls.term_id === filterTerm);
    }

    if (filterSubject) {
      filtered = filtered.filter(cls => cls.subject_id === filterSubject);
    }

    const uniqueClasses = new Map();
    filtered.forEach(cls => {
      if (cls.class_name && cls._id) {
        uniqueClasses.set(cls.class_name, cls);
      }
    });

    return Array.from(uniqueClasses.values());
  };

  const getTotalWeight = () => {
    if (!filterStudent) return 0;
    return components
      .filter(c => c.student_id === filterStudent)
      .reduce((sum, c) => sum + c.weight, 0);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="teacher-content">
      <h2>Grade Components</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Manage grade components (tests, homework, attendance, participation) and their weights
      </p>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            School Year:
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '150px'
            }}
          >
            <option value="">Select Year</option>
            {schoolYears.map(year => (
              <option key={year._id} value={year._id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Term:
          </label>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            disabled={!filterYear}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '120px',
              opacity: !filterYear ? 0.5 : 1,
              cursor: !filterYear ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Select Term</option>
            {getFilteredTerms().map(term => (
              <option key={term._id} value={term._id}>
                Term {term.term_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Subject:
          </label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            disabled={!filterTerm}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '200px',
              opacity: !filterTerm ? 0.5 : 1,
              cursor: !filterTerm ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Select Subject</option>
            {getFilteredSubjects().map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Class:
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            disabled={!filterSubject}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '150px',
              opacity: !filterSubject ? 0.5 : 1,
              cursor: !filterSubject ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Select Class</option>
            {getFilteredClasses().map(cls => (
              <option key={cls._id} value={cls.class_name}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Student:
          </label>
          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            disabled={!filterClass}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '200px',
              opacity: !filterClass ? 0.5 : 1,
              cursor: !filterClass ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.given_name} {student.surname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Component Button */}
      {filterYear && filterTerm && filterSubject && filterClass && (
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => {
              if (!showAddForm) {
                // Pre-populate form with selected filters
                const selectedClass = getFilteredClasses().find(c => c.class_name === filterClass);
                setFormData({
                  ...formData,
                  subject_id: filterSubject,
                  term_id: filterTerm,
                  class_id: selectedClass?._id || ''
                });
              }
              setShowAddForm(!showAddForm);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Grade Component'}
          </button>
        </div>
      )}

      {/* Add Component Form */}
      {showAddForm && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'var(--card)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Grade Component</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Student: *
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.given_name} {student.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Component Type: *
                </label>
                <select
                  value={formData.component_type}
                  onChange={(e) => setFormData({ ...formData, component_type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                >
                  {COMPONENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Component Name: *
                </label>
                <input
                  type="text"
                  value={formData.component_name}
                  onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                  placeholder="e.g., Tests Average, Homework 1"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Description:
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Score: *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.max_score}
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  placeholder="e.g., 15.5"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Max Score: *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Weight (%): *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 60 for 60%"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Notes:
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Save Component
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Weight Summary */}
      {filterStudent && components.filter(c => c.student_id === filterStudent).length > 0 && (
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          background: getTotalWeight() === 100 ? '#28a74520' : '#ffc10720',
          borderRadius: '8px',
          border: `2px solid ${getTotalWeight() === 100 ? '#28a745' : '#ffc107'}`
        }}>
          <strong>Total Weight: {getTotalWeight().toFixed(0)}%</strong>
          {getTotalWeight() === 100 ? ' ✓ Complete' : ' (Need 100% for final grade)'}
        </div>
      )}

      {/* Components Table */}
      {filterYear && filterTerm && filterSubject && filterClass ? (
        components.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--card)',
            borderRadius: '8px',
            color: 'var(--muted)'
          }}>
            No grade components yet. Add components to calculate term grades.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--card)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Component</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Score</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Weight</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Notes</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map((component) => (
                  <tr key={component._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{component.student_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{component.component_name}</div>
                      {component.description && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          {component.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {COMPONENT_TYPES.find(t => t.value === component.component_type)?.label || component.component_type}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                      {component.score} / {component.max_score}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {component.weight}%
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                      {component.notes || '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(component._id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: '1px solid #dc3545',
                          background: 'transparent',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--card)',
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          Please select Year, Term, Subject, and Class to manage grade components
        </div>
      )}
    </div>
  );
};

export default TeacherGradeComponents;

