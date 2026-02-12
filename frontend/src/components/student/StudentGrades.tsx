import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

interface AssessmentType {
  _id: string;
  type_name: string;
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

interface SubjectGradeBreakdown {
  subject_id: string;
  subject_name: string;
  class_name: string;
  term_id: string;
  term_number: number;
  year_name: string;
  tests_grade: number | null; // 0-20 scale
  homework_grade: number | null; // 0-20 scale
  attendance_grade: number | null; // 0-20 scale
  final_term_grade: number | null; // 0-20 scale
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
  const { t } = useTranslation();
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [subjectGrades, setSubjectGrades] = useState<SubjectGradeBreakdown[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterAssessmentType, setFilterAssessmentType] = useState<string>('');

  // Fetch current student's database ID when user loads
  useEffect(() => {
    const fetchCurrentStudent = async () => {
      if (!user || isAdmin) return; // Skip for admins
      
      try {
        // Try to find student by username or email
        const studentsResp = await apiService.getStudents();
        if (studentsResp.success && studentsResp.data) {
          const students = (studentsResp.data as any)?.message || [];
          const student = students.find((s: any) => 
            s.username === user.username || s.email === user.email
          );
          
          if (student) {
            console.log('[StudentGrades] Found student record:', student._id, 'for username:', user.username);
            setCurrentStudentId(student._id);
          } else {
            console.warn('[StudentGrades] No student record found for username:', user.username, 'email:', user.email);
          }
        }
      } catch (error) {
        console.error('[StudentGrades] Error fetching student record:', error);
      }
    };
    
    if (user?.id) {
      fetchCurrentStudent();
      loadInitialData();
    }
  }, [user?.id, user?.username, user?.email, isAdmin]);

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

  const calculateSubjectGrades = useCallback(async (studentId: string) => {
    if (!filterTerm) {
      setSubjectGrades([]);
      return;
    }

    try {
      // Always fetch assignments for this student to calculate component breakdown
      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      if (filterClass) params.append('class_name', filterClass);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/student/assignments?${queryString}` : '/student/assignments';
      const assignmentsResponse = await apiService.get(endpoint);
      
      let studentAssignments: StudentAssignment[] = [];
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignmentsData = (assignmentsResponse.data as any)?.assignments || [];
        studentAssignments = assignmentsData.filter((sa: StudentAssignment) => 
          sa.student_id === studentId
        );
      }

      console.log('[calculateSubjectGrades] Found assignments:', studentAssignments.length);
      
      // Fetch term grades for final grade (if they exist)
      const termGradesResp = await apiService.getTermGrades({
        student_id: studentId,
        term_id: filterTerm
      });

      const termGradesMap = new Map<string, any>();
      if (termGradesResp.success && termGradesResp.data) {
        const termGrades = (termGradesResp.data as any)?.term_grades || [];
        console.log('[calculateSubjectGrades] Found term grades:', termGrades.length);
        termGrades.forEach((tg: any) => {
          termGradesMap.set(tg.subject_id, tg);
        });
      } else {
        console.log('[calculateSubjectGrades] No term grades found (this is OK - they calculate automatically when assignments are graded)');
      }
      
      // Get test and homework assessment types
      const testType = assessmentTypes.find(t => t.type_name === 'Test');
      const homeworkType = assessmentTypes.find(t => t.type_name === 'Homework');
      
      // Group assignments by subject
      const subjectMap = new Map<string, {
        subject_id: string;
        subject_name: string;
        class_name: string;
        term_id: string;
        term_number: number;
        year_name: string;
        assignments: StudentAssignment[];
      }>();
      
      studentAssignments.forEach(assignment => {
        const subjectId = assignment.assignment.subject_id;
        const key = `${subjectId}-${assignment.class_name}`;
        
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            subject_id: subjectId,
            subject_name: assignment.subject_name,
            class_name: assignment.class_name,
            term_id: assignment.assignment.term_id,
            term_number: assignment.term_number,
            year_name: assignment.year_name,
            assignments: []
          });
        }
        
        subjectMap.get(key)!.assignments.push(assignment);
      });
      
      console.log('[calculateSubjectGrades] Grouped into subjects:', subjectMap.size);
      
      // Build subject grade breakdown
      const breakdown: SubjectGradeBreakdown[] = [];
      
      for (const [, subjectData] of subjectMap.entries()) {
        const subjectAssignments = subjectData.assignments;
        
        // Calculate Tests component (0-20 scale)
        let testsGrade: number | null = null;
        if (testType) {
          const testAssignments = subjectAssignments.filter(a => 
            a.assessment_type_name === 'Test' && a.score !== null && a.status === 'graded'
          );
          
          if (testAssignments.length > 0) {
            let totalPercentage = 0;
            testAssignments.forEach(a => {
              const percentage = (a.score! / a.assignment.max_score) * 100;
              totalPercentage += percentage;
            });
            const avgPercentage = totalPercentage / testAssignments.length;
            testsGrade = (avgPercentage / 100) * 20; // Convert to 0-20 scale
          }
        }
        
        // Calculate Homework component (0-20 scale) - completion based
        let homeworkGrade: number | null = null;
        if (homeworkType) {
          const homeworkAssignments = subjectAssignments.filter(a => 
            a.assessment_type_name === 'Homework'
          );
          const completedHomework = subjectAssignments.filter(a => 
            a.assessment_type_name === 'Homework' && a.status === 'graded'
          );
          
          if (homeworkAssignments.length > 0) {
            const completionPercentage = (completedHomework.length / homeworkAssignments.length) * 100;
            homeworkGrade = (completionPercentage / 100) * 20; // Convert to 0-20 scale
          }
        }
        
        // Attendance - we'll need to fetch this separately or calculate from attendance records
        // For now, set to null and we can enhance later
        const attendanceGrade: number | null = null;
        
        // Get final term grade if it exists
        const termGrade = termGradesMap.get(subjectData.subject_id);
        const finalTermGrade = termGrade?.final_grade ? parseFloat(termGrade.final_grade) : null;
        
        breakdown.push({
          subject_id: subjectData.subject_id,
          subject_name: subjectData.subject_name,
          class_name: subjectData.class_name,
          term_id: subjectData.term_id,
          term_number: subjectData.term_number,
          year_name: subjectData.year_name,
          tests_grade: testsGrade,
          homework_grade: homeworkGrade,
          attendance_grade: attendanceGrade,
          final_term_grade: finalTermGrade
        });
      }
      
      // Apply filters
      let filtered = breakdown;
      if (filterSubject) {
        filtered = filtered.filter(sg => sg.subject_name === filterSubject);
      }
      if (filterClass) {
        filtered = filtered.filter(sg => sg.class_name === filterClass);
      }
      
      setSubjectGrades(filtered);
    } catch (error) {
      console.error('Error calculating subject grades:', error);
      setSubjectGrades([]);
    }
  }, [filterTerm, filterSubject, filterClass, assessmentTypes, filterYear]);

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

  // Calculate subject grades when term is selected (function will fetch assignments if needed)
  useEffect(() => {
    if (filterTerm && assessmentTypes.length > 0) {
      const studentId = isAdmin && selectedStudent 
        ? selectedStudent._id 
        : (currentStudentId || user?.id); // Use database student_id if available
      if (studentId) {
        console.log('[StudentGrades] Calculating grades for student_id:', studentId);
        calculateSubjectGrades(studentId);
      }
    } else if (!filterTerm) {
      setSubjectGrades([]);
    }
  }, [filterTerm, selectedStudent, currentStudentId, user?.id, isAdmin, calculateSubjectGrades, assessmentTypes.length]);

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

      // Load assessment types
      const typesResp = await apiService.getAssessmentTypes();
      if (typesResp.success && typesResp.data) {
        const typesData = (typesResp.data as any)?.assessment_types || (typesResp.data as any)?.message || typesResp.data || [];
        setAssessmentTypes(Array.isArray(typesData) ? typesData : []);
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
        // Simple average - weight is no longer part of assignments
        const studentsWithScores = Array.from(studentMap.values()).map(student => {
          const studentAssignments = assignmentsData.filter((sa: StudentAssignment) => 
            sa.student_id === student._id && sa.score !== null
          );
          
          if (studentAssignments.length > 0) {
            let totalPercentage = 0;
            
            studentAssignments.forEach((sa: StudentAssignment) => {
              const percentage = (sa.score! / sa.assignment.max_score) * 100;
              totalPercentage += percentage;
            });
            
            const average100 = totalPercentage / studentAssignments.length;
            const average20 = (average100 / 100) * 20;
            student.overall_score = parseFloat(average20.toFixed(2));
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
        }
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };


  const getFilteredAssignments = () => {
    let filtered = assignments;
    
    // Filter by assessment type if selected
    if (filterAssessmentType) {
      const selectedType = assessmentTypes.find(t => t._id === filterAssessmentType);
      if (selectedType) {
        filtered = filtered.filter(sa => {
          // Handle case where assessment_type_name might be null/undefined
          if (!sa.assessment_type_name) {
            return false;
          }
          // Case-insensitive comparison with trimmed strings
          return sa.assessment_type_name.trim().toLowerCase() === selectedType.type_name.trim().toLowerCase();
        });
      }
    }
    
    return filtered;
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
    return <div>{t('student.grades.loadingGrades')}</div>;
  }

  console.log('[StudentGrades] RENDER - assignments state:', assignments.length);
  console.log('[StudentGrades] RENDER - filters:', { filterYear, filterTerm, filterSubject, filterClass, filterAssessmentType });
  console.log('[StudentGrades] RENDER - assessmentTypes:', assessmentTypes.length);
  
  const filteredAssignments = getFilteredAssignments();
  
  console.log('[StudentGrades] RENDER - filteredAssignments:', filteredAssignments.length);
  if (filterAssessmentType) {
    console.log('[StudentGrades] RENDER - Filter active, showing', filteredAssignments.length, 'of', assignments.length, 'assignments');
  }

  return (
    <div className="student-grades">
      <h2>{t('student.grades.title')}</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        {t('student.grades.subtitle')}
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
            {t('common.schoolYear')}
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
            <option value="">{t('common.allYears')}</option>
            {schoolYears.map(year => (
              <option key={year._id} value={year._id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t('common.term')}
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
            <option value="">{t('common.allTerms')}</option>
            {getFilteredTerms().map(term => (
              <option key={term._id} value={term._id}>
                {t('common.termNumber', { number: term.term_number })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t('common.class')}
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
            <option value="">{t('common.allClasses')}</option>
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
              {t('common.subject')}
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
              <option value="">{t('common.allSubjects')}</option>
              {getFilteredSubjects().map(subject => (
                <option key={subject._id} value={subject.subject_name}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assessment Type filter */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t('common.type')}
          </label>
          <select
            value={filterAssessmentType}
            onChange={(e) => setFilterAssessmentType(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '150px'
            }}
          >
            <option value="">{t('common.allTypes')}</option>
            {assessmentTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.type_name}
              </option>
            ))}
          </select>
        </div>

        {/* Student filter (for admin) */}
        {isAdmin && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {t('common.student')}
            </label>
            <select
              value={selectedStudent?._id || ''}
              onChange={(e) => {
                const studentId = e.target.value;
                const student = students.find(s => s._id === studentId);
                setSelectedStudent(student || null);
              }}
              disabled={!filterClass || students.length === 0}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                minWidth: '200px',
                opacity: !filterClass || students.length === 0 ? 0.5 : 1,
                cursor: !filterClass || students.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">{t('common.selectStudent')}</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.given_name} {student.surname}
                </option>
              ))}
            </select>
          </div>
        )}

        {(filterYear || filterTerm || filterClass || filterSubject || filterAssessmentType) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setFilterYear('');
                setFilterTerm('');
                setFilterSubject('');
                setFilterClass('');
                setFilterAssessmentType('');
                setSelectedStudent(null);
                setStudents([]);
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
              {t('common.clearFilters')}
            </button>
          </div>
        )}
      </div>


      {/* Term Grades by Subject Section */}
      {(!isAdmin || selectedStudent) && filterTerm && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📊 {t('student.grades.termGradesBySubject')}</h3>
        
          {subjectGrades.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              background: 'var(--card)',
              borderRadius: '8px',
              color: 'var(--muted)'
            }}>
              {filterTerm ? (
                <div>
                  <p>{t('student.grades.noGradesForTerm')}</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--muted)' }}>
                    {t('student.grades.gradesAutoCalculated')}
                    {filterSubject && ` ${t('student.grades.setupCriteria')}`}
                  </p>
                </div>
              ) : (
                t('student.grades.selectTermToView')
              )}
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
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('student.grades.subjectCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('student.grades.classCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.testsCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.homeworkCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.attendanceCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center', background: 'rgba(0, 123, 255, 0.1)' }}>{t('student.grades.finalTermGrade')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectGrades.map((sg) => {
                    const getGradeDisplay = (grade: number | null) => {
                      if (grade === null) return <span style={{ color: 'var(--muted)' }}>-</span>;
                      const color = getGradeColor(grade);
                      return (
                        <span style={{ 
                          fontWeight: 600, 
                          color: color,
                          fontSize: '1.1rem'
                        }}>
                          {grade.toFixed(2)} / 20
                        </span>
                      );
                    };
                    
                    return (
                      <tr key={`${sg.subject_id}-${sg.term_id}-${sg.class_name}`} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{sg.subject_name}</td>
                        <td style={{ padding: '1rem' }}>{sg.class_name}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {getGradeDisplay(sg.tests_grade)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {getGradeDisplay(sg.homework_grade)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {getGradeDisplay(sg.attendance_grade)}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          textAlign: 'center',
                          background: sg.final_term_grade !== null ? getGradeColor(sg.final_term_grade!) + '20' : 'transparent',
                          fontWeight: 700,
                          fontSize: '1.2rem'
                        }}>
                          {sg.final_term_grade !== null ? (
                            <span style={{ color: getGradeColor(sg.final_term_grade) }}>
                              {sg.final_term_grade.toFixed(2)} / 20
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>{t('student.grades.notCalculated')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Individual Assignment Grades Section (Optional - can be collapsed) */}
      {(!isAdmin || selectedStudent) && filteredAssignments.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <details style={{ cursor: 'pointer' }}>
            <summary style={{ 
              marginBottom: '1rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              padding: '0.5rem',
              cursor: 'pointer'
            }}>
              📝 {t('student.grades.individualGrades', { count: filteredAssignments.length })}
            </summary>
        
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
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('student.grades.assignmentCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('student.grades.subjectCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('student.grades.classCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.yearCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.scoreCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.percentageCol')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('student.grades.gradedOn')}</th>
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
                          {formatDate(sa.graded_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      {/* Legend */}
      {(!isAdmin || selectedStudent) && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--card)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>{t('student.grades.gradeScale')}</strong>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#28a745' }}>■ {t('student.grades.excellent')}</span>
            <span style={{ color: '#17a2b8' }}>■ {t('student.grades.good')}</span>
            <span style={{ color: '#ffc107' }}>■ {t('student.grades.satisfactory')}</span>
            <span style={{ color: '#dc3545' }}>■ {t('student.grades.needsImprovement')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;

