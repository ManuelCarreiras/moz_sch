import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useUser } from '../../contexts/AuthContext';

interface Subject {
  _id: string;
  subject_name: string;
  department_name?: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

interface Term {
  _id: string;
  term_number: number;
  year_id: string;
}

interface ClassItem {
  class_id: string;
  class_name: string;
}

interface StudentYearGrade {
  _id: string;
  student_id: string;
  subject_id: string;
  year_id: string;
  calculated_average: number;
  total_weight_graded: number;
  last_updated: string;
  subject_name?: string;
  year_name?: string;
}

interface StudentAssignment {
  _id: string;
  student_id: string;
  assignment_id: string;
  score: number | null;
  submission_date: string | null;
  graded_date: string | null;
  feedback: string | null;
  status: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    subject_id: string;
    class_id: string;
    term_id: string;
    due_date: string | null;
    max_score: number;
    weight: number;
    status: string;
  };
  student_name?: string;
  subject_name: string;
  class_name: string;
  term_number: number;
  year_name: string;
  assessment_type_name: string;
  year_id?: string;
}

interface StudentInfo {
  _id: string;
  given_name: string;
  surname: string;
  date_of_birth: string;
  class_name?: string;
  overall_score?: number;
}

const StudentGrades: React.FC = () => {
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  const [yearGrades, setYearGrades] = useState<StudentYearGrade[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);

  // Reset dependent filters when parent filters change
  useEffect(() => {
    setFilterTerm('');
    setFilterClass('');
    setFilterSubject('');
  }, [filterYear]);

  useEffect(() => {
    setFilterClass('');
    setFilterSubject('');
  }, [filterTerm]);

  useEffect(() => {
    setFilterSubject('');
  }, [filterClass]);

  // Load students when class is selected (for admin)
  useEffect(() => {
    if (isAdmin && filterClass) {
      loadStudentsInClass();
    } else {
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [filterClass]);

  // Reset selected student when filters change
  useEffect(() => {
    setSelectedStudent(null);
  }, [filterYear, filterTerm, filterClass]);

  // Reload assignments when filters change or student is selected
  useEffect(() => {
    console.log('[StudentGrades] Filter changed:', { filterYear, filterTerm, filterSubject, filterClass, selectedStudent: selectedStudent?._id });
    
    if (isAdmin) {
      // For admin, only load if a student is selected
      if (user?.id && subjects.length > 0 && selectedStudent) {
        console.log('[StudentGrades] Admin - Calling loadAssignments for selected student...');
        const timer = setTimeout(() => {
          loadAssignmentsForStudent(selectedStudent._id);
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // For students, load their own assignments
      if (user?.id && subjects.length > 0) {
        console.log('[StudentGrades] Student - Calling loadAssignments...');
        const timer = setTimeout(() => {
          loadAssignments();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [filterYear, filterTerm, filterSubject, filterClass, selectedStudent]);

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

      // Load all classes
      const classesResp = await apiService.getClasses();
      if (classesResp.success && classesResp.data) {
        const classesData = (classesResp.data as any)?.message || [];
        setAllClasses(Array.isArray(classesData) ? classesData : []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsInClass = async () => {
    try {
      console.log('[StudentGrades] Loading students for class:', filterClass);
      
      // Get ALL assignments for this class (all subjects) to calculate overall averages
      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      if (filterClass) params.append('class_name', filterClass);
      // Don't filter by subject - we want all subjects for overall average
      
      const queryString = params.toString();
      const endpoint = queryString ? `/student/assignments?${queryString}` : '/student/assignments';
      
      const response = await apiService.get(endpoint);
      
      if (response.success && response.data) {
        const assignmentsData = (response.data as any)?.assignments || [];
        
        // Extract unique students and calculate their overall scores (across ALL subjects)
        const studentMap = new Map<string, StudentInfo>();
        
        assignmentsData.forEach((sa: StudentAssignment) => {
          if (!studentMap.has(sa.student_id)) {
            studentMap.set(sa.student_id, {
              _id: sa.student_id,
              given_name: sa.student_name?.split(' ')[0] || '',
              surname: sa.student_name?.split(' ').slice(1).join(' ') || '',
              date_of_birth: '', // We'll need to fetch this separately if needed
              class_name: sa.class_name,
              overall_score: 0
            });
          }
        });
        
        // Calculate overall scores for each student (across ALL subjects)
        const studentsWithScores = Array.from(studentMap.values()).map(student => {
          const studentAssignments = assignmentsData.filter((sa: StudentAssignment) => 
            sa.student_id === student._id && sa.score !== null
          );
          
          if (studentAssignments.length > 0) {
            let totalWeightedScore = 0;
            let totalWeight = 0;
            
            studentAssignments.forEach((sa: StudentAssignment) => {
              const percentage = (sa.score! / sa.assignment.max_score) * 100;
              const weightedScore = percentage * sa.assignment.weight;
              totalWeightedScore += weightedScore;
              totalWeight += sa.assignment.weight;
            });
            
            if (totalWeight > 0) {
              const average100 = totalWeightedScore / totalWeight;
              const average20 = (average100 / 100) * 20;
              student.overall_score = parseFloat(average20.toFixed(2));
            }
          }
          
          return student;
        });
        
        console.log('[StudentGrades] Loaded students with overall scores:', studentsWithScores);
        setStudents(studentsWithScores);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAssignmentsForStudent = async (studentId: string) => {
    try {
      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      const selectedSubject = subjects.find(s => s.subject_name === filterSubject);
      if (selectedSubject) params.append('subject_id', selectedSubject._id);
      if (filterClass) params.append('class_name', filterClass);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/student/assignments?${queryString}` : '/student/assignments';
      
      console.log('[StudentGrades] Loading assignments for student:', studentId, 'from:', endpoint);
      const response = await apiService.get(endpoint);
      
      if (response.success && response.data) {
        const assignmentsData = (response.data as any)?.assignments || [];
        // Filter to only this student's assignments
        const studentAssignments = assignmentsData.filter((sa: StudentAssignment) => 
          sa.student_id === studentId && sa.score !== null
        );
        console.log('[StudentGrades] Student assignments:', studentAssignments.length);
        setAssignments(studentAssignments);
        calculateYearGrades(studentAssignments);
      }
    } catch (error) {
      console.error('Error loading student assignments:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      let response;
      
      if (isAdmin) {
        // Admin: Load ALL student assignments with server-side filters using direct API call
        const params = new URLSearchParams();
        if (filterYear) params.append('year_id', filterYear);
        if (filterTerm) params.append('term_id', filterTerm);
        if (filterSubject) {
          const selectedSubject = subjects.find(s => s.subject_name === filterSubject);
          if (selectedSubject) {
            params.append('subject_id', selectedSubject._id);
          }
        }
        if (filterClass) params.append('class_name', filterClass);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/student/assignments?${queryString}` : '/student/assignments';
        
        console.log('[StudentGrades] Admin loading from:', endpoint);
        response = await apiService.get(endpoint);
        console.log('[StudentGrades] Admin response:', response);
        
        if (response.success && response.data) {
          // apiService wraps the response: { success: true, data: { success: true, assignments: [...] } }
          const assignmentsData = (response.data as any)?.assignments || [];
          console.log('[StudentGrades] Admin loaded:', assignmentsData.length, 'assignments');
          console.log('[StudentGrades] First assignment:', assignmentsData[0]);
          // Show assignments that have a score (regardless of status)
          const loadedAssignments = assignmentsData.filter((sa: StudentAssignment) => sa.score !== null);
          console.log('[StudentGrades] Graded assignments:', loadedAssignments.length);
          setAssignments(loadedAssignments);
          calculateYearGrades(loadedAssignments);
        } else {
          console.log('[StudentGrades] No data in response');
        }
      } else {
        // Student: Load only my assignments with filters
        const params: any = {};
        if (filterYear) params.year_id = filterYear;
        if (filterTerm) params.term_id = filterTerm;
        if (filterSubject) {
          const selectedSubject = subjects.find(s => s.subject_name === filterSubject);
          if (selectedSubject) {
            params.subject_id = selectedSubject._id;
          }
        }
        if (filterClass) params.class_name = filterClass;

        console.log('[StudentGrades] Student loading with params:', params);
        response = await apiService.getStudentAssignments(params);
        console.log('[StudentGrades] Student response:', response);
        
        if (response.success && response.data) {
          const assignmentsData = (response.data as any)?.assignments || [];
          // Show assignments that have a score (regardless of status)
          const loadedAssignments = assignmentsData.filter((sa: StudentAssignment) => sa.score !== null);
          console.log('[StudentGrades] Graded assignments:', loadedAssignments.length);
          setAssignments(loadedAssignments);
          calculateYearGrades(loadedAssignments);
        }
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const calculateYearGrades = (assignmentsData: StudentAssignment[]) => {
    // Group by subject and year
    const gradesBySubjectYear = new Map<string, StudentAssignment[]>();
    
    assignmentsData.forEach((sa: StudentAssignment) => {
      if (sa.score !== null) {
        const key = `${sa.subject_name}-${sa.year_name}`;
        if (!gradesBySubjectYear.has(key)) {
          gradesBySubjectYear.set(key, []);
        }
        gradesBySubjectYear.get(key)?.push(sa);
      }
    });

    // Calculate averages
    const yearGradesData: StudentYearGrade[] = [];
    gradesBySubjectYear.forEach((assignments, key) => {
      const [subjectName, yearName] = key.split('-');
      
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      assignments.forEach((sa) => {
        const percentage = (sa.score! / sa.assignment.max_score) * 100;
        const weightedScore = percentage * sa.assignment.weight;
        totalWeightedScore += weightedScore;
        totalWeight += sa.assignment.weight;
      });
      
      if (totalWeight > 0) {
        const average100 = totalWeightedScore / totalWeight;
        const average20 = (average100 / 100) * 20;
        
        // Find subject and year IDs
        const subject = subjects.find(s => s.subject_name === subjectName);
        const year = schoolYears.find(y => y.year_name === yearName);
        
        yearGradesData.push({
          _id: `${subject?._id || ''}-${year?._id || ''}`,
          student_id: user?.id || '',
          subject_id: subject?._id || '',
          year_id: year?._id || '',
          calculated_average: parseFloat(average20.toFixed(2)),
          total_weight_graded: totalWeight,
          last_updated: new Date().toISOString(),
          subject_name: subjectName,
          year_name: yearName
        });
      }
    });
    
    setYearGrades(yearGradesData);
  };

  const getFilteredYearGrades = () => {
    // No client-side filtering needed - data is already filtered server-side
    // Just return all year grades
    return yearGrades;
  };

  const getFilteredAssignments = () => {
    // No client-side filtering needed - data is already filtered server-side
    // Just return all assignments
    return assignments;
  };

  // Get filtered options for cascading dropdowns
  const getFilteredTerms = () => {
    if (!filterYear) return terms;
    return terms.filter(t => t.year_id === filterYear);
  };

  const getFilteredClasses = () => {
    // Filter classes based on selected year and term
    let filtered = allClasses;

    // Filter by year
    if (filterYear) {
      filtered = filtered.filter(cls => {
        // Get the term for this class
        const term = terms.find(t => t._id === cls.term_id);
        return term && term.year_id === filterYear;
      });
    }

    // Filter by term
    if (filterTerm) {
      filtered = filtered.filter(cls => cls.term_id === filterTerm);
    }

    // Get unique class names
    const uniqueClasses = new Map<string, ClassItem>();
    filtered.forEach(cls => {
      if (cls.class_name && cls._id) {
        uniqueClasses.set(cls.class_name, {
          class_id: cls._id,
          class_name: cls.class_name
        });
      }
    });

    return Array.from(uniqueClasses.values());
  };

  const getFilteredSubjects = () => {
    // Filter subjects based on selected class
    if (!filterClass) {
      // Show all subjects if no class is selected
      return subjects;
    }

    // Find classes with the selected class name
    const matchingClasses = allClasses.filter(cls => cls.class_name === filterClass);
    
    // Get unique subject IDs from these classes
    const subjectIds = new Set(matchingClasses.map(cls => cls.subject_id));
    
    // Return subjects that are taught in this class
    return subjects.filter(s => subjectIds.has(s._id));
  };

  const getGradeColor = (average: number) => {
    // 0-20 scale
    if (average >= 16) return '#28a745'; // Green (80%+)
    if (average >= 14) return '#17a2b8'; // Blue (70-79%)
    if (average >= 10) return '#ffc107'; // Yellow (50-69%)
    return '#dc3545'; // Red (<50%)
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div>Loading grades...</div>;
  }

  console.log('[StudentGrades] RENDER - assignments state:', assignments.length);
  console.log('[StudentGrades] RENDER - yearGrades state:', yearGrades.length);
  console.log('[StudentGrades] RENDER - filters:', { filterYear, filterTerm, filterSubject, filterClass });
  
  const filteredYearGrades = getFilteredYearGrades();
  const filteredAssignments = getFilteredAssignments();
  
  console.log('[StudentGrades] RENDER - filteredYearGrades:', filteredYearGrades.length);
  console.log('[StudentGrades] RENDER - filteredAssignments:', filteredAssignments.length);
  console.log('[StudentGrades] RENDER - filteredAssignments data:', filteredAssignments);

  return (
    <div className="student-grades">
      <h2>Grades</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        View grades and academic performance across all subjects
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
            <option value="">All Years</option>
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
            <option value="">All Terms</option>
            {getFilteredTerms().map(term => (
              <option key={term._id} value={term._id}>
                Term {term.term_number}
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
            disabled={!filterTerm}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '150px',
              opacity: !filterTerm ? 0.5 : 1,
              cursor: !filterTerm ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">All Classes</option>
            {getFilteredClasses().map(cls => (
              <option key={cls.class_id} value={cls.class_name}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject filter only shows for students or when admin has selected a student */}
        {(!isAdmin || selectedStudent) && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Subject:
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
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
              <option value="">All Subjects</option>
              {getFilteredSubjects().map(subject => (
                <option key={subject._id} value={subject.subject_name}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {(filterYear || filterTerm || filterClass || filterSubject) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setFilterYear('');
                setFilterTerm('');
                setFilterSubject('');
                setFilterClass('');
                setSelectedStudent(null);
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Student Selection Section (for admin) */}
      {isAdmin && students.length > 0 && !selectedStudent && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>👥 Select a Student</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {students.map(student => (
              <div
                key={student._id}
                onClick={() => setSelectedStudent(student)}
                style={{
                  padding: '1.5rem',
                  background: 'var(--card)',
                  borderRadius: '8px',
                  border: '2px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text)'
                }}>
                  {student.given_name} {student.surname}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--muted)',
                  marginBottom: '0.75rem'
                }}>
                  Class: {student.class_name}
                </div>
                {student.overall_score !== undefined && student.overall_score > 0 && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Year Average (All Subjects):
                    </span>
                    <span style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700,
                      color: getGradeColor(student.overall_score)
                    }}>
                      {student.overall_score.toFixed(2)} / 20
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back to Student List Button (for admin when student is selected) */}
      {isAdmin && selectedStudent && (
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setSelectedStudent(null)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Back to Student List
          </button>
          <div style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            Viewing grades for: {selectedStudent.given_name} {selectedStudent.surname}
          </div>
        </div>
      )}

      {/* Year Averages Section */}
      {(!isAdmin || selectedStudent) && (
        <>
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📊 Year Averages (0-20 Scale)</h3>
        
        {filteredYearGrades.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            background: 'var(--card)',
            borderRadius: '8px',
            color: 'var(--muted)'
          }}>
            No year grades available yet
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {filteredYearGrades.map(yg => (
              <div
                key={yg._id}
                style={{
                  padding: '1.5rem',
                  background: 'var(--card)',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: getGradeColor(yg.calculated_average)
                }}
              >
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--muted)',
                  marginBottom: '0.5rem'
                }}>
                  {yg.subject_name} • {yg.year_name}
                </div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700,
                  color: getGradeColor(yg.calculated_average),
                  marginBottom: '0.25rem'
                }}>
                  {yg.calculated_average.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  / 20
                </div>
                <div style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '0.8rem', 
                  color: 'var(--muted)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.5rem'
                }}>
                  {yg.total_weight_graded.toFixed(0)}% of assignments graded
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Grades Section */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>📝 Individual Assignment Grades</h3>
        
        {filteredAssignments.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            background: 'var(--card)',
            borderRadius: '8px',
            color: 'var(--muted)'
          }}>
            No graded assignments yet
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
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Assignment</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Class</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Year</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Score</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Percentage</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Weight</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Graded On</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((sa) => {
                  const percentage = sa.score !== null 
                    ? ((sa.score / sa.assignment.max_score) * 100).toFixed(1)
                    : '-';
                  
                  return (
                    <tr key={sa._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{sa.assignment.title}</div>
                        {sa.assessment_type_name && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            {sa.assessment_type_name}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>{sa.subject_name}</td>
                      <td style={{ padding: '1rem' }}>{sa.class_name}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{sa.year_name}</td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        {sa.score !== null ? `${sa.score} / ${sa.assignment.max_score}` : '-'}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center',
                        color: getGradeColor((parseFloat(percentage) / 100) * 20)
                      }}>
                        {percentage !== '-' ? `${percentage}%` : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {sa.assignment.weight}%
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {formatDate(sa.graded_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Legend */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--card)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>Grade Scale (0-20):</strong>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#28a745' }}>■ 16-20: Excellent</span>
            <span style={{ color: '#17a2b8' }}>■ 14-15.9: Good</span>
            <span style={{ color: '#ffc107' }}>■ 10-13.9: Satisfactory</span>
            <span style={{ color: '#dc3545' }}>■ 0-9.9: Needs Improvement</span>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default StudentGrades;

