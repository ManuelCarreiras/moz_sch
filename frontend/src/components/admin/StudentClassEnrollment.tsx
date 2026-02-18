import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  year_id?: string;
  year_name?: string;
  term_id?: string;
  term_number?: number;
}

interface StudentClass {
  _id: string;
  student_id: string;
  class_id: string;
  score: number;
}

export function StudentClassEnrollment({ onBack }: StudentClassEnrollmentProps) {
  const { t } = useTranslation();
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
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset selected students when class changes
    setSelectedStudentIds(new Set());
    setShowConfirmation(false);
  }, [selectedClassId]);

  useEffect(() => {
    // Reset class selection when year or term filter changes
    setSelectedClassId('');
    setSelectedStudentIds(new Set());
    setShowConfirmation(false);
  }, [selectedYearId, selectedTermId]);

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
      setError(t('admin.classEnrollment.enrollError'));
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get students with no class assigned in the selected year/term
  const getUnassignedStudents = (): Student[] => {
    // Build a set of enrolled student IDs, but only for classes matching the current filters
    const enrolledStudentIds = new Set<string>();
    
    studentClasses.forEach(sc => {
      const classObj = classes.find(c => c._id === sc.class_id);
      if (classObj) {
        // Check if this class matches the current filters
        let matches = true;
        if (selectedYearId && classObj.year_id !== selectedYearId) {
          matches = false;
        }
        if (selectedTermId && classObj.term_id !== selectedTermId) {
          matches = false;
        }
        if (matches) {
          enrolledStudentIds.add(sc.student_id);
        }
      }
    });
    
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

  // Get unique years from classes
  const getUniqueYears = (): { year_id: string; year_name: string }[] => {
    const yearMap = new Map<string, string>();
    classes.forEach(cls => {
      if (cls.year_id && cls.year_name) {
        yearMap.set(cls.year_id, cls.year_name);
      }
    });
    return Array.from(yearMap.entries())
      .map(([year_id, year_name]) => ({ year_id, year_name }))
      .sort((a, b) => b.year_name.localeCompare(a.year_name)); // Most recent first
  };

  // Get unique terms from classes, optionally filtered by year
  const getUniqueTerms = (): { term_id: string; term_number: number; year_id: string }[] => {
    const termMap = new Map<string, { term_number: number; year_id: string }>();
    classes.forEach(cls => {
      if (cls.term_id && cls.term_number) {
        // If year filter is selected, only include terms from that year
        if (!selectedYearId || cls.year_id === selectedYearId) {
          termMap.set(cls.term_id, { term_number: cls.term_number!, year_id: cls.year_id! });
        }
      }
    });
    return Array.from(termMap.entries())
      .map(([term_id, { term_number, year_id }]) => ({ term_id, term_number, year_id }))
      .sort((a, b) => a.term_number - b.term_number);
  };

  // Get unique class names, filtered by year and term if selected
  const getUniqueClassNames = (): { name: string; classes: Class[] }[] => {
    const classMap = new Map<string, Class[]>();
    classes.forEach(cls => {
      // Filter by year if selected
      if (selectedYearId && cls.year_id !== selectedYearId) {
        return;
      }
      // Filter by term if selected
      if (selectedTermId && cls.term_id !== selectedTermId) {
        return;
      }
      
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
      setError(t('admin.classEnrollment.selectClassAndStudents'));
      return;
    }

    setIsEnrolling(true);
    setError(null);

    try {
      // Find all classes with the selected class name
      const selectedClassName = classes.find(c => c._id === selectedClassId)?.class_name;
      if (!selectedClassName) {
        setError(t('admin.classEnrollment.classNotFound'));
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
        setError(t('admin.classEnrollment.someEnrollmentsFailed'));
      } else {
        const totalEnrollments = selectedStudentIds.size * classesToEnrollIn.length;
        alert(t('admin.classEnrollment.enrollSuccess', {
          students: selectedStudentIds.size,
          classes: classesToEnrollIn.length,
          total: totalEnrollments
        }));
        // Reset state
        setSelectedClassId('');
        setSelectedStudentIds(new Set());
        setShowConfirmation(false);
        // Reload data
        await loadData();
      }
    } catch (err) {
      setError(t('admin.classEnrollment.enrollError'));
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
          <p>{t('admin.classEnrollment.loadingData')}</p>
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
          {t('admin.classEnrollment.backToClasses')}
        </button>
        <div>
          <h2>{t('admin.classEnrollment.title')}</h2>
          <p>{t('admin.classEnrollment.subtitle')}</p>
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
          {t('admin.classEnrollment.step1')}
        </h3>
        
        {/* Year and Term Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', maxWidth: '800px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="year_filter" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-xs)',
              fontSize: '0.875rem',
              fontWeight: 500 
            }}>
              {t('admin.classEnrollment.schoolYearLabel')}
            </label>
            <select
              id="year_filter"
              value={selectedYearId}
              onChange={(e) => {
                setSelectedYearId(e.target.value);
                setSelectedTermId(''); // Reset term when year changes
              }}
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
              <option value="">{t('admin.classEnrollment.allYearsPlaceholder')}</option>
              {getUniqueYears().map((year) => (
                <option 
                  key={year.year_id} 
                  value={year.year_id}
                  style={{ background: 'var(--card)', color: 'var(--text)' }}
                >
                  {year.year_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="term_filter" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-xs)',
              fontSize: '0.875rem',
              fontWeight: 500 
            }}>
              {t('admin.classEnrollment.termLabel')}
            </label>
            <select
              id="term_filter"
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
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
              <option value="">{t('admin.classEnrollment.allTermsPlaceholder')}</option>
              {getUniqueTerms().map((term) => (
                <option 
                  key={term.term_id} 
                  value={term.term_id}
                  style={{ background: 'var(--card)', color: 'var(--text)' }}
                >
                  {t('common.termNumber', { number: term.term_number })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ maxWidth: '400px' }}>
          <label htmlFor="class_selection" style={{ 
            display: 'block', 
            marginBottom: 'var(--space-xs)',
            fontSize: '0.875rem',
            fontWeight: 500 
          }}>
            {t('admin.classEnrollment.chooseClass')}
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
            <option value="">{t('admin.classEnrollment.selectAClass')}</option>
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
              {t('admin.classEnrollment.step2')}
            </h3>
            {unassignedStudents.length > 0 && (
              <button
                className="btn btn--secondary"
                onClick={handleSelectAll}
                style={{ fontSize: '0.875rem' }}
              >
                {selectedStudentIds.size === unassignedStudents.length ? t('admin.classEnrollment.deselectAll') : t('admin.classEnrollment.selectAll')}
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
              <p>{t('admin.classEnrollment.allAssigned')}</p>
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
                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>{t('admin.classEnrollment.studentName')}</th>
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
                {t('admin.classEnrollment.studentsSelected', { count: selectedStudentIds.size })}
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
                {t('admin.classEnrollment.continueConfirm')}
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
              <h3>{t('admin.classEnrollment.confirmEnrollment')}</h3>
              <button 
                className="modal__close"
                onClick={() => setShowConfirmation(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <p style={{ marginBottom: 'var(--space-md)' }}>
                {t('admin.classEnrollment.confirmQuestion', { count: selectedStudentIds.size })}
              </p>
              
              <div style={{ 
                marginBottom: 'var(--space-md)',
                padding: 'var(--space-md)',
                background: 'var(--surface)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)'
              }}>
                <strong>{t('admin.classEnrollment.classLabel')}</strong> {selectedClassName}
                <div style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  ({t('admin.classEnrollment.subjects', { count: selectedClassGroup.classes.length })})
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
                  {t('common.cancel')}
                </button>
                <button 
                  type="button" 
                  className="btn btn--primary"
                  onClick={handleConfirmEnrollment}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? t('admin.classEnrollment.enrolling') : t('admin.classEnrollment.confirmEnrollment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}