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
  subject_id?: string;
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
  
  // New enrollment flow state
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset selected students when class changes
    setSelectedStudentIds(new Set());
    setShowConfirmation(false);
  }, [selectedClassId]);

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

  // Get students with no class assigned
  const getUnassignedStudents = (): Student[] => {
    const enrolledStudentIds = new Set(studentClasses.map(sc => sc.student_id));
    return students.filter(student => !enrolledStudentIds.has(student._id));
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const unassignedStudents = getUnassignedStudents();
    if (selectedStudentIds.size === unassignedStudents.length) {
      // Deselect all
      setSelectedStudentIds(new Set());
    } else {
      // Select all
      setSelectedStudentIds(new Set(unassignedStudents.map(s => s._id)));
    }
  };

  // Get unique class names
  const getUniqueClassNames = (): { name: string; classes: Class[] }[] => {
    const classMap = new Map<string, Class[]>();
    classes.forEach(cls => {
      if (!classMap.has(cls.class_name)) {
        classMap.set(cls.class_name, []);
      }
      classMap.get(cls.class_name)!.push(cls);
    });
    
    // Convert to array and sort by class name
    return Array.from(classMap.entries())
      .map(([name, classList]) => ({ name, classes: classList }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedClassId || selectedStudentIds.size === 0) {
      setError('Please select a class and at least one student');
      return;
    }

    setIsEnrolling(true);
    setError(null);

    try {
      // Find all classes with the selected class name
      const selectedClassName = classes.find(c => c._id === selectedClassId)?.class_name;
      if (!selectedClassName) {
        setError('Selected class not found');
        setIsEnrolling(false);
        return;
      }

      const classesToEnrollIn = classes.filter(c => c.class_name === selectedClassName);
      
      // Enroll each selected student in ALL classes with this name
      const enrollmentPromises: Promise<any>[] = [];
      
      Array.from(selectedStudentIds).forEach(studentId => {
        classesToEnrollIn.forEach(classItem => {
          enrollmentPromises.push(
            apiService.createStudentClass({
              student_id: studentId,
              class_id: classItem._id,
              score: 0 // Default score
            })
          );
        });
      });

      const results = await Promise.all(enrollmentPromises);
      
      // Check if all enrollments succeeded
      const failed = results.some(r => !r.success);
      
      if (failed) {
        setError('Some enrollments failed. Please try again.');
      } else {
        const totalEnrollments = selectedStudentIds.size * classesToEnrollIn.length;
        alert(`Successfully enrolled ${selectedStudentIds.size} student(s) in ${classesToEnrollIn.length} class(es) (${totalEnrollments} total enrollments)!`);
        // Reset state
        setSelectedClassId('');
        setSelectedStudentIds(new Set());
        setShowConfirmation(false);
        // Reload data
        await loadData();
      }
    } catch (err) {
      setError('Network error occurred during enrollment');
      console.error('Error enrolling students:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const getStudentName = (student: Student) => {
    return `${student.given_name} ${student.middle_name || ''} ${student.surname}`.trim();
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

  const unassignedStudents = getUnassignedStudents();
  const uniqueClassNames = getUniqueClassNames();
  const selectedClassName = selectedClassId ? uniqueClassNames.find(ucn => 
    ucn.classes.some(c => c._id === selectedClassId)
  )?.name : null;
  const selectedClassGroup = selectedClassName ? uniqueClassNames.find(ucn => ucn.name === selectedClassName) : null;

  // Update selectedClassId when class name selection changes
  const handleClassChange = (className: string) => {
    const classGroup = uniqueClassNames.find(ucn => ucn.name === className);
    if (classGroup && classGroup.classes.length > 0) {
      setSelectedClassId(classGroup.classes[0]._id); // Use first class ID as identifier
    } else {
      setSelectedClassId('');
    }
  };

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn--secondary" onClick={onBack}>
          ← Back to Classes
        </button>
        <div>
          <h2>Student Class Enrollment</h2>
          <p>Select a class and enroll unassigned students.</p>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Step 1: Class Selection */}
      <div style={{ 
        background: 'var(--card)', 
        padding: 'var(--space-lg)', 
        borderRadius: '0.5rem',
        marginBottom: 'var(--space-lg)',
        border: '1px solid var(--border)'
      }}>
        <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 600 }}>
          Step 1: Select Class
        </h3>
        <div style={{ maxWidth: '400px' }}>
          <label htmlFor="class_selection" style={{ 
            display: 'block', 
            marginBottom: 'var(--space-xs)',
            fontSize: '0.875rem',
            fontWeight: 500 
          }}>
            Choose a class to enroll students into:
          </label>
          <select
            id="class_selection"
            value={selectedClassName || ''}
            onChange={(e) => handleClassChange(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm)',
              borderRadius: '0.25rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 'var(--text-base)',
              WebkitAppearance: 'menulist',
              MozAppearance: 'menulist',
              appearance: 'menulist'
            }}
          >
            <option value="">-- Select a Class --</option>
            {uniqueClassNames.map((classGroup) => (
              <option 
                key={classGroup.name} 
                value={classGroup.name}
                style={{ background: 'var(--card)', color: 'var(--text)' }}
              >
                {classGroup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Student Selection */}
      {selectedClassId && (
        <div style={{ 
          background: 'var(--card)', 
          padding: 'var(--space-lg)', 
          borderRadius: '0.5rem',
          marginBottom: 'var(--space-lg)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
              Step 2: Select Students to Enroll
            </h3>
            {unassignedStudents.length > 0 && (
              <button
                className="btn btn--secondary"
                onClick={handleSelectAll}
                style={{ fontSize: '0.875rem' }}
              >
                {selectedStudentIds.size === unassignedStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {unassignedStudents.length === 0 ? (
            <div style={{ 
              padding: 'var(--space-lg)', 
              textAlign: 'center',
              background: 'var(--surface)',
              borderRadius: '0.25rem',
              color: 'var(--text-muted)'
            }}>
              <p>All students are already assigned to classes.</p>
            </div>
          ) : (
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              background: 'var(--surface)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--card)', zIndex: 10 }}>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ 
                      padding: 'var(--space-sm)', 
                      textAlign: 'left',
                      width: '40px'
                    }}>
                      <input
                        type="checkbox"
                        checked={unassignedStudents.length > 0 && selectedStudentIds.size === unassignedStudents.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Student Name</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedStudents.map((student) => (
                    <tr 
                      key={student._id}
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: selectedStudentIds.has(student._id) ? 'rgba(74, 144, 226, 0.1)' : 'transparent'
                      }}
                      onClick={() => handleStudentToggle(student._id)}
                    >
                      <td style={{ padding: 'var(--space-sm)' }}>
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.has(student._id)}
                          onChange={() => handleStudentToggle(student._id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: 'var(--space-sm)' }}>
                        {getStudentName(student)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedStudentIds.size > 0 && (
            <div style={{ 
              marginTop: 'var(--space-md)',
              padding: 'var(--space-md)',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '0.25rem',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {selectedStudentIds.size} student{selectedStudentIds.size !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {selectedStudentIds.size > 0 && (
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn--primary"
                onClick={() => setShowConfirmation(true)}
                disabled={isEnrolling}
              >
                Continue to Confirmation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation Modal */}
      {showConfirmation && selectedClassGroup && selectedClassName && (
        <div className="modal">
          <div className="modal__overlay" onClick={() => setShowConfirmation(false)}></div>
          <div className="modal__dialog" style={{ maxWidth: '600px' }}>
            <div className="modal__header">
              <h3>Confirm Enrollment</h3>
              <button 
                className="modal__close"
                onClick={() => setShowConfirmation(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <p style={{ marginBottom: 'var(--space-md)' }}>
                Are you sure you want to enroll the following {selectedStudentIds.size} student{selectedStudentIds.size !== 1 ? 's' : ''} in all classes for:
              </p>
              
              <div style={{ 
                marginBottom: 'var(--space-md)',
                padding: 'var(--space-md)',
                background: 'var(--surface)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)'
              }}>
                <strong>Class:</strong> {selectedClassName}
                <div style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  ({selectedClassGroup.classes.length} subject{selectedClassGroup.classes.length !== 1 ? 's' : ''})
                </div>
              </div>

              <div style={{ 
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: 'var(--space-md)',
                border: '1px solid var(--border)',
                borderRadius: '0.25rem',
                background: 'var(--surface)'
              }}>
                <ul style={{ listStyle: 'none', padding: 'var(--space-sm)', margin: 0 }}>
                  {Array.from(selectedStudentIds).map(studentId => {
                    const student = students.find(s => s._id === studentId);
                    return student ? (
                      <li key={studentId} style={{ padding: 'var(--space-xs)' }}>
                        • {getStudentName(student)}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn--secondary"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isEnrolling}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn--primary"
                  onClick={handleConfirmEnrollment}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}