import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useUser } from '../../contexts/AuthContext';

interface StudentMetrics {
  homework_completion_ratio: number;
  attendance_ratio: number;
  test_average: number;
  term_grade_average?: number | null;
}

interface StudentPosition {
  percentile: number;
  rank: number;
  total_students: number;
  student_average: number;
}

interface TermGradePosition {
  percentile: number;
  rank: number;
  total_students: number;
  student_grade: number;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date?: string;
  end_date?: string;
}

interface Term {
  _id: string;
  term_number: number;
  year_id: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface TeacherClass {
  _id: string;
  class_name: string;
  subject_id?: string;
  term_id?: string;
}

interface StudentInfo {
  _id: string;
  given_name: string;
  surname: string;
  class_name: string;
}

const StudentOverview: React.FC = () => {
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  const [studentMetrics, setStudentMetrics] = useState<StudentMetrics | null>(null);
  const [classTestScores, setClassTestScores] = useState<number[]>([]);
  const [studentTestScores, setStudentTestScores] = useState<number[]>([]);
  const [studentPosition, setStudentPosition] = useState<StudentPosition | null>(null);
  const [classTermGrades, setClassTermGrades] = useState<number[]>([]);
  const [studentTermGrades, setStudentTermGrades] = useState<number[]>([]);
  const [termGradePosition, setTermGradePosition] = useState<TermGradePosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (filterYear) {
      loadTerms();
    } else {
      setTerms([]);
      setFilterTerm('');
      setClasses([]);
      setFilterClass('');
    }
  }, [filterYear]);

  useEffect(() => {
    if (filterYear && (filterTerm || filterSubject)) {
      loadClasses();
    } else {
      setClasses([]);
      setFilterClass('');
    }
  }, [filterYear, filterTerm, filterSubject]);

  useEffect(() => {
    loadStudentOverview();
  }, [filterYear, filterTerm, filterSubject, filterClass]);

  const loadFilterOptions = async () => {
    try {
      const yearsResponse = await apiService.getSchoolYears();
      if (yearsResponse.success && yearsResponse.data) {
        const allYears = (yearsResponse.data as any)?.message || [];
        const yearsArray = Array.isArray(allYears) ? allYears : [];
        const now = new Date();
        const activeYears = yearsArray.filter((year: SchoolYear) => {
          if (!year.start_date || !year.end_date) return false;
          const endDate = new Date(year.end_date);
          return endDate >= now;
        });
        setSchoolYears(activeYears.length > 0 ? activeYears : yearsArray);
      }

      const subjectsResponse = await apiService.getSubjects();
      if (subjectsResponse.success && subjectsResponse.data) {
        const subs = (subjectsResponse.data as any)?.message || [];
        setSubjects(Array.isArray(subs) ? subs : []);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadTerms = async () => {
    try {
      const response = await apiService.getTerms();
      if (response.success && response.data) {
        const termsData = (response.data as any)?.message || [];
        const filteredTerms = termsData.filter((t: Term) => t.year_id === filterYear);
        setTerms(filteredTerms);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await apiService.getClasses();
      if (response.success && response.data) {
        const classesData = (response.data as any)?.message || [];
        let filtered = classesData;
        
        if (filterYear) {
          filtered = filtered.filter((cls: any) => {
            const term = terms.find(t => t._id === cls.term_id);
            return term && term.year_id === filterYear;
          });
        }
        
        if (filterTerm) {
          filtered = filtered.filter((cls: any) => cls.term_id === filterTerm);
        }
        
        if (filterSubject) {
          filtered = filtered.filter((cls: any) => cls.subject_id === filterSubject);
        }
        
        // Deduplicate by class_name
        const uniqueClasses = new Map<string, TeacherClass>();
        filtered.forEach((cls: any) => {
          if (cls.class_name && cls._id) {
            uniqueClasses.set(cls.class_name, {
              _id: cls._id,
              class_name: cls.class_name,
              subject_id: cls.subject_id,
              term_id: cls.term_id
            });
          }
        });
        
        setClasses(Array.from(uniqueClasses.values()));
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  // Load students when class is selected (for admin)
  useEffect(() => {
    if (isAdmin && filterClass) {
      loadStudentsInClass();
    } else {
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [filterClass, isAdmin]);

  // Reset selected student when filters change
  useEffect(() => {
    setSelectedStudent(null);
  }, [filterYear, filterTerm, filterClass]);

  // Reload overview when filters change or student is selected
  useEffect(() => {
    if (isAdmin) {
      // For admin, only load if a student is selected
      if (selectedStudent) {
        loadStudentOverview();
      }
    } else {
      // For students, load their own data
      loadStudentOverview();
    }
  }, [filterYear, filterTerm, filterSubject, filterClass, selectedStudent]);

  const loadStudentsInClass = async () => {
    try {
      if (!filterClass) {
        setStudents([]);
        return;
      }

      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      if (filterClass) params.append('class_name', filterClass);

      const queryString = params.toString();
      const endpoint = queryString ? `/student/assignments?${queryString}` : '/student/assignments';

      const response = await apiService.get(endpoint);
      
      if (response.success && response.data) {
        const assignmentsData = (response.data as any)?.assignments || [];
        
        // Extract unique students from assignments
        const studentsMap = new Map<string, StudentInfo>();
        assignmentsData.forEach((assignment: any) => {
          if (assignment.student_id && assignment.student_name) {
            if (!studentsMap.has(assignment.student_id)) {
              studentsMap.set(assignment.student_id, {
                _id: assignment.student_id,
                given_name: assignment.student_name.split(' ')[0] || '',
                surname: assignment.student_name.split(' ').slice(1).join(' ') || '',
                class_name: filterClass
              });
            }
          }
        });
        
        setStudents(Array.from(studentsMap.values()));
      }
    } catch (error) {
      console.error('Error loading students in class:', error);
      setStudents([]);
    }
  };

  const loadStudentOverview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      if (filterSubject) params.append('subject_id', filterSubject);
      if (filterClass) params.append('class_name', filterClass);
      
      // For admin, add student_id parameter
      if (isAdmin && selectedStudent) {
        params.append('student_id', selectedStudent._id);
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `/student/overview?${queryString}` : '/student/overview';
      
      const response = await apiService.get(endpoint);
      
      console.log('[StudentOverview] API response:', response);
      
      if (response.success && response.data) {
        const data = response.data as any;
        console.log('[StudentOverview] Parsed data:', data);
        
        setStudentMetrics(data.student_metrics || null);
        setClassTestScores(data.class_test_scores || []);
        setStudentTestScores(data.student_test_scores || []);
        setStudentPosition(data.student_position || null);
        setClassTermGrades(data.class_term_grades || []);
        setStudentTermGrades(data.student_term_grades || []);
        setTermGradePosition(data.term_grade_position || null);
      } else {
        console.warn('[StudentOverview] No data in response:', response);
      }
    } catch (error) {
      console.error('Error loading student overview:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics for class test scores (include student's own scores for full distribution)
  const allTestScores = [...classTestScores, ...studentTestScores];
  const testScoreStats = allTestScores.length > 0 ? (() => {
    const sorted = [...allTestScores].sort((a, b) => a - b);
    const mean = allTestScores.reduce((a, b) => a + b, 0) / allTestScores.length;
    const variance = allTestScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allTestScores.length;
    const stdDev = Math.sqrt(variance);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    return {
      mean,
      median,
      stdDev,
      min: Math.min(...allTestScores),
      max: Math.max(...allTestScores),
      q1,
      q3,
      count: allTestScores.length
    };
  })() : { 
    mean: 0, median: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0, count: 0 
  };

  // Create histogram data
  const bins = [0, 20, 40, 60, 80, 100];
  const histogram = bins.slice(0, -1).map((min, i) => {
    const max = bins[i + 1];
    const isLastBin = i === bins.length - 2; // Last bin should include the max value
    const count = allTestScores.filter(score => 
      score >= min && (isLastBin ? score <= max : score < max)
    ).length;
    return { min, max, count, percentage: allTestScores.length > 0 ? (count / allTestScores.length) * 100 : 0 };
  });

  // Generate normal distribution curve points
  const generateNormalCurve = () => {
    if (allTestScores.length < 3 || testScoreStats.stdDev === 0) return [];
    const points: { x: number; y: number }[] = [];
    const range = testScoreStats.max - testScoreStats.min;
    const step = range / 50;
    
    for (let x = Math.max(0, testScoreStats.min - range * 0.2); x <= Math.min(100, testScoreStats.max + range * 0.2); x += step) {
      const exp = -0.5 * Math.pow((x - testScoreStats.mean) / testScoreStats.stdDev, 2);
      const y = (1 / (testScoreStats.stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
      points.push({ x, y });
    }
    
    const maxY = Math.max(...points.map(p => p.y));
    return points.map(p => ({ x: p.x, y: p.y / maxY }));
  };

  const normalCurvePoints = generateNormalCurve();

  // Get student's average test score for positioning
  const studentAvgTestScore = studentMetrics?.test_average ?? null;

  // Term Grade Distribution Statistics (include student's own grades for full distribution)
  const allTermGrades = [...classTermGrades, ...studentTermGrades];
  const termGradeStats = allTermGrades.length > 0 ? (() => {
    const sorted = [...allTermGrades].sort((a, b) => a - b);
    const mean = allTermGrades.reduce((a, b) => a + b, 0) / allTermGrades.length;
    const variance = allTermGrades.reduce((sum, grade) => sum + Math.pow(grade - mean, 2), 0) / allTermGrades.length;
    const stdDev = Math.sqrt(variance);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    return {
      mean,
      median,
      stdDev,
      min: Math.min(...allTermGrades),
      max: Math.max(...allTermGrades),
      q1,
      q3,
      count: allTermGrades.length
    };
  })() : { 
    mean: 0, median: 0, stdDev: 0, min: 0, max: 20, q1: 0, q3: 0, count: 0 
  };

  // Create term grade histogram data (0-20 scale)
  const termGradeBins = [0, 4, 8, 12, 16, 20];
  const termGradeHistogram = termGradeBins.slice(0, -1).map((min, i) => {
    const max = termGradeBins[i + 1];
    const isLastBin = i === termGradeBins.length - 2; // Last bin should include the max value
    const count = allTermGrades.filter(grade => 
      grade >= min && (isLastBin ? grade <= max : grade < max)
    ).length;
    return { min, max, count, percentage: allTermGrades.length > 0 ? (count / allTermGrades.length) * 100 : 0 };
  });

  // Generate normal distribution curve for term grades
  const generateTermGradeNormalCurve = () => {
    if (allTermGrades.length < 3 || termGradeStats.stdDev === 0) return [];
    const points: { x: number; y: number }[] = [];
    const range = termGradeStats.max - termGradeStats.min;
    const step = range / 50;
    
    for (let x = Math.max(0, termGradeStats.min - range * 0.2); x <= Math.min(20, termGradeStats.max + range * 0.2); x += step) {
      const exp = -0.5 * Math.pow((x - termGradeStats.mean) / termGradeStats.stdDev, 2);
      const y = (1 / (termGradeStats.stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
      points.push({ x, y });
    }
    
    const maxY = Math.max(...points.map(p => p.y));
    return points.map(p => ({ x: p.x, y: p.y / maxY }));
  };

  const termGradeNormalCurvePoints = generateTermGradeNormalCurve();
  const studentAvgTermGrade = studentMetrics?.term_grade_average || 0;

  const CircularProgress: React.FC<{ value: number; max: number; label: string; isTermGrade?: boolean }> = ({ value, max, label, isTermGrade = false }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    const getColor = () => {
      if (percentage >= 80) return '#28a745';
      if (percentage >= 60) return '#ffc107';
      if (percentage >= 40) return '#ff9800';
      return '#dc3545';
    };
    
    const strokeColor = getColor();
    
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1rem' }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: strokeColor,
              lineHeight: '1.2'
            }}>
              {isTermGrade ? `${value.toFixed(1)}/20` : `${value.toFixed(1)}%`}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#aaa',
              marginTop: '0.25rem'
            }}>
              {isTermGrade ? `${percentage.toFixed(0)}%` : `of ${max}%`}
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: 500,
          color: '#fff',
          marginTop: '0.5rem'
        }}>
          {label}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading overview...</div>;
  }

  return (
    <div className="student-overview" style={{ paddingBottom: '2rem', overflow: 'visible' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Overview</h2>
        <p>View your academic performance metrics</p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            School Year
          </label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterTerm('');
              setFilterSubject('');
              setFilterClass('');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Years</option>
            {schoolYears.map((year) => (
              <option key={year._id} value={year._id}>{year.year_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Term
          </label>
          <select
            value={filterTerm}
            onChange={(e) => {
              setFilterTerm(e.target.value);
              setFilterSubject('');
              setFilterClass('');
            }}
            disabled={!filterYear}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Terms</option>
            {terms.map((term) => (
              <option key={term._id} value={term._id}>Term {term.term_number}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Subject
          </label>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilterClass('');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.subject_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Class
          </label>
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setSelectedStudent(null);
            }}
            disabled={!filterYear || (!filterTerm && !filterSubject)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls.class_name}>{cls.class_name}</option>
            ))}
          </select>
        </div>

        {/* Student Selection (for admin) */}
        {isAdmin && (
          <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Student
          </label>
          <select
            value={selectedStudent?._id || ''}
            onChange={(e) => {
              const studentId = e.target.value;
              const student = students.find(s => s._id === studentId);
              setSelectedStudent(student || null);
            }}
            disabled={!filterClass || students.length === 0}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">Select a Student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.given_name} {student.surname}
              </option>
            ))}
          </select>
        </div>
        )}
      </div>

      {/* Student Performance Metrics */}
      {(!isAdmin || selectedStudent) && studentMetrics ? (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <CircularProgress value={studentMetrics.homework_completion_ratio} max={100} label="Homework Completion" />
            <CircularProgress value={studentMetrics.attendance_ratio} max={100} label="Attendance Ratio" />
            <CircularProgress value={studentMetrics.test_average} max={100} label="Test Average" />
            {studentMetrics.term_grade_average !== null && studentMetrics.term_grade_average !== undefined && (
              <CircularProgress value={studentMetrics.term_grade_average} max={20} label="Term Grade" isTermGrade={true} />
            )}
          </div>

          {/* Class Test Score Distribution */}
          {allTestScores.length > 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '1.5rem',
              overflow: 'visible'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.5rem' }}>
                Class Test Score Distribution
                {studentPosition && (
                  <span style={{ fontSize: '1rem', color: '#aaa', marginLeft: '1rem', fontWeight: 'normal' }}>
                    (You are ranked #{studentPosition.rank} of {studentPosition.total_students} - {studentPosition.percentile.toFixed(1)}th percentile)
                  </span>
                )}
              </h3>
              
              {/* Statistics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mean (μ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a9eff' }}>
                    {testScoreStats.mean.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Median</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#9b59b6' }}>
                    {testScoreStats.median.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Std Dev (σ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f39c12' }}>
                    {testScoreStats.stdDev.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Range</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
                    {testScoreStats.min.toFixed(1)} - {testScoreStats.max.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Count</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {testScoreStats.count}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Average</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2ecc71' }}>
                    {studentAvgTestScore !== null && studentAvgTestScore !== undefined ? `${studentAvgTestScore.toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Histogram with Normal Curve and Student Position */}
              <div style={{ position: 'relative', padding: '1.5rem 1rem 3rem 1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', overflow: 'visible' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: '0.5rem', 
                  height: '200px',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  position: 'relative'
                }}>
                  {/* Y-axis labels */}
                  {(() => {
                    const maxCount = Math.max(...histogram.map(b => b.count), 1);
                    const midCount = Math.ceil(maxCount / 2);
                    return (
                      <div style={{ 
                        position: 'absolute', 
                        left: '-2.5rem', 
                        top: 0, 
                        bottom: '1rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        color: '#888',
                        width: '2rem'
                      }}>
                        <span>{maxCount}</span>
                        {maxCount > 1 && <span>{midCount}</span>}
                        <span>0</span>
                      </div>
                    );
                  })()}

                  {/* Bars */}
                  {histogram.map((bin, index) => {
                    const maxCount = Math.max(...histogram.map(b => b.count), 1);
                    const barHeight = maxCount > 0 ? (bin.count / maxCount) * 180 : 0;
                    const barColor = index === 0 ? '#e74c3c' : 
                                     index === 1 ? '#f39c12' : 
                                     index === 2 ? '#f1c40f' : 
                                     index === 3 ? '#27ae60' : '#2ecc71';
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end',
                          position: 'relative',
                          cursor: bin.count > 0 ? 'pointer' : 'default'
                        }}
                        title={`${bin.count} ${bin.count === 1 ? 'score' : 'scores'} in range ${bin.min}-${bin.max}%`}
                      >
                        {bin.count > 0 && (
                          <div 
                            className="histogram-tooltip"
                            style={{
                              position: 'absolute',
                              bottom: `${barHeight + 5}px`,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'rgba(0, 0, 0, 0.9)',
                              color: '#fff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              zIndex: 10,
                              pointerEvents: 'none',
                              opacity: 0,
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            {bin.count}
                          </div>
                        )}
                        {bin.count > 0 ? (
                          <div 
                            style={{ 
                              width: '100%', 
                              height: `${Math.max(barHeight, 4)}px`, 
                              background: barColor,
                              borderRadius: '4px 4px 0 0',
                              transition: 'all 0.2s',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              minHeight: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                              const tooltip = e.currentTarget.parentElement?.querySelector('.histogram-tooltip');
                              if (tooltip) (tooltip as HTMLElement).style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                              const tooltip = e.currentTarget.parentElement?.querySelector('.histogram-tooltip');
                              if (tooltip) (tooltip as HTMLElement).style.opacity = '0';
                            }}
                          />
                        ) : (
                          <div 
                            style={{ 
                              width: '100%', 
                              height: '2px', 
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px 4px 0 0'
                            }}
                          />
                        )}
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: '#888', 
                          marginTop: '0.5rem',
                          textAlign: 'center'
                        }}>
                          {bin.min}-{bin.max}%
                        </div>
                      </div>
                    );
                  })}

                  {/* Normal Distribution Curve Overlay */}
                  {normalCurvePoints.length > 0 && (
                    <svg 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '200px',
                        pointerEvents: 'none',
                        overflow: 'visible'
                      }}
                    >
                      <path
                        d={`M ${normalCurvePoints.map((p, i) => {
                          const visualX = ((p.x - testScoreStats.min) / (testScoreStats.max - testScoreStats.min || 1)) * 100;
                          const visualY = 200 - (p.y * 180);
                          return `${i === 0 ? 'M' : 'L'} ${visualX}% ${visualY}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="rgba(74, 158, 255, 0.6)"
                        strokeWidth="2"
                      />
                    </svg>
                  )}

                  {/* Student Position Marker */}
                  {studentAvgTestScore !== null && studentAvgTestScore !== undefined && allTestScores.length > 0 && (() => {
                    // Calculate position based on histogram bins (0-20, 20-40, 40-60, 60-80, 80-100)
                    const bins = [0, 20, 40, 60, 80, 100];
                    const numBins = bins.length - 1;
                    let binIndex = 0;
                    
                    // Find which bin the score falls into
                    for (let i = 0; i < numBins; i++) {
                      if (studentAvgTestScore >= bins[i] && studentAvgTestScore < bins[i + 1]) {
                        binIndex = i;
                        break;
                      }
                    }
                    if (studentAvgTestScore >= 100) binIndex = numBins - 1;
                    
                    // Calculate position within the bin (0-100% of bin width)
                    const binMin = bins[binIndex];
                    const binMax = bins[binIndex + 1];
                    const binWidth = binMax - binMin;
                    const positionInBin = binWidth > 0 ? ((studentAvgTestScore - binMin) / binWidth) : 0.5;
                    
                    // Calculate overall position: bin start + position within bin
                    // Each bin is 1/numBins of the total width
                    const binStartPercent = (binIndex / numBins) * 100;
                    const binWidthPercent = (1 / numBins) * 100;
                    const position = binStartPercent + (positionInBin * binWidthPercent);
                    
                    const isOutOfRange = testScoreStats.max > testScoreStats.min && (studentAvgTestScore > testScoreStats.max || studentAvgTestScore < testScoreStats.min);
                    
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: `${Math.max(0, Math.min(100, position))}%`,
                          transform: 'translateX(-50%)',
                          width: '3px',
                          height: '180px',
                          background: isOutOfRange ? '#ff6b6b' : '#2ecc71',
                          zIndex: 5,
                          boxShadow: isOutOfRange ? '0 0 10px rgba(255, 107, 107, 0.8)' : '0 0 10px rgba(46, 204, 113, 0.8)'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-30px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: isOutOfRange ? '#ff6b6b' : '#2ecc71',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          zIndex: 10
                        }}>
                          You: {studentAvgTestScore.toFixed(1)}%
                          {isOutOfRange && studentAvgTestScore > testScoreStats.max && ' ⬆'}
                          {isOutOfRange && studentAvgTestScore < testScoreStats.min && ' ⬇'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              color: '#aaa'
            }}>
              No class test scores available yet
            </div>
          )}

          {/* Class Term Grade Distribution */}
          {allTermGrades.length > 0 && studentMetrics?.term_grade_average !== null && studentMetrics?.term_grade_average !== undefined ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              marginTop: '2rem',
              overflow: 'visible'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.5rem' }}>
                Class Term Grade Distribution (0-20 Scale)
                {termGradePosition && (
                  <span style={{ fontSize: '1rem', color: '#aaa', marginLeft: '1rem', fontWeight: 'normal' }}>
                    (You are ranked #{termGradePosition.rank} of {termGradePosition.total_students} - {termGradePosition.percentile.toFixed(1)}th percentile)
                  </span>
                )}
              </h3>
              
              {/* Statistics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mean (μ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a9eff' }}>
                    {termGradeStats.mean.toFixed(1)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Median</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#9b59b6' }}>
                    {termGradeStats.median.toFixed(1)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Std Dev (σ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f39c12' }}>
                    {termGradeStats.stdDev.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Range</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e67e22' }}>
                    {termGradeStats.min.toFixed(1)} - {termGradeStats.max.toFixed(1)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Grade</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2ecc71' }}>
                    {studentAvgTermGrade.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Histogram with Normal Curve and Student Position */}
              <div style={{ position: 'relative', padding: '1.5rem 1rem 3rem 1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', overflow: 'visible' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: '0.5rem', 
                  height: '200px',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  position: 'relative'
                }}>
                  {/* Y-axis labels */}
                  {(() => {
                    const maxCount = Math.max(...termGradeHistogram.map(b => b.count), 1);
                    const midCount = Math.ceil(maxCount / 2);
                    return (
                      <div style={{ 
                        position: 'absolute', 
                        left: '-2.5rem', 
                        top: 0, 
                        bottom: '1rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        color: '#888',
                        width: '2rem'
                      }}>
                        <span>{maxCount}</span>
                        {maxCount > 1 && <span>{midCount}</span>}
                        <span>0</span>
                      </div>
                    );
                  })()}

                  {/* Bars */}
                  {(() => {
                    const maxCount = Math.max(...termGradeHistogram.map(b => b.count), 1);
                    return termGradeHistogram.map((bin, index) => {
                    const barHeight = maxCount > 0 ? (bin.count / maxCount) * 180 : 0;
                    const barColor = index === 0 ? '#e74c3c' : 
                                     index === 1 ? '#f39c12' : 
                                     index === 2 ? '#f1c40f' : 
                                     index === 3 ? '#27ae60' : '#2ecc71';
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end',
                          position: 'relative',
                          cursor: bin.count > 0 ? 'pointer' : 'default'
                        }}
                        title={`${bin.count} ${bin.count === 1 ? 'grade' : 'grades'} in range ${bin.min}-${bin.max}`}
                      >
                        {bin.count > 0 && (
                          <div 
                            className="histogram-tooltip"
                            style={{
                              position: 'absolute',
                              bottom: `${barHeight + 5}px`,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'rgba(0, 0, 0, 0.9)',
                              color: '#fff',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              zIndex: 10,
                              pointerEvents: 'none',
                              opacity: 0,
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                          >
                            {bin.count} {bin.count === 1 ? 'grade' : 'grades'}: {bin.min.toFixed(1)} - {bin.max.toFixed(1)}
                          </div>
                        )}
                        <div 
                          style={{ 
                            width: '100%',
                            height: `${barHeight}px`,
                            background: barColor,
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.2s',
                            minHeight: bin.count > 0 ? '4px' : '0'
                          }}
                          onMouseEnter={(e) => {
                            const tooltip = e.currentTarget.parentElement?.querySelector('.histogram-tooltip') as HTMLElement;
                            if (tooltip) tooltip.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const tooltip = e.currentTarget.parentElement?.querySelector('.histogram-tooltip') as HTMLElement;
                            if (tooltip) tooltip.style.opacity = '0';
                          }}
                        />
                      </div>
                    );
                    });
                  })()}

                  {/* Normal distribution curve overlay */}
                  {termGradeNormalCurvePoints.length > 0 && (
                    <svg 
                      style={{ 
                        position: 'absolute', 
                        left: 0, 
                        right: 0, 
                        top: 0, 
                        bottom: '1rem',
                        width: '100%',
                        height: '180px',
                        pointerEvents: 'none',
                        overflow: 'visible'
                      }}
                    >
                      <polyline
                        points={termGradeNormalCurvePoints.map((p) => {
                          const visualX = ((p.x - termGradeStats.min) / (termGradeStats.max - termGradeStats.min || 1)) * 100;
                          const visualY = 180 - (p.y * 160);
                          return `${visualX}%,${visualY}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(74, 158, 255, 0.6)"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {/* Student Term Grade Position Marker */}
                  {studentAvgTermGrade > 0 && studentTermGrades.length > 0 && allTermGrades.length > 0 && (() => {
                    // Calculate position based on term grade histogram bins (0-4, 4-8, 8-12, 12-16, 16-20)
                    const bins = [0, 4, 8, 12, 16, 20];
                    const numBins = bins.length - 1;
                    let binIndex = 0;
                    
                    // Find which bin the grade falls into
                    for (let i = 0; i < numBins; i++) {
                      if (studentAvgTermGrade >= bins[i] && studentAvgTermGrade < bins[i + 1]) {
                        binIndex = i;
                        break;
                      }
                    }
                    if (studentAvgTermGrade >= 20) binIndex = numBins - 1;
                    
                    // Calculate position within the bin (0-100% of bin width)
                    const binMin = bins[binIndex];
                    const binMax = bins[binIndex + 1];
                    const binWidth = binMax - binMin;
                    const positionInBin = binWidth > 0 ? ((studentAvgTermGrade - binMin) / binWidth) : 0.5;
                    
                    // Calculate overall position: bin start + position within bin
                    // Each bin is 1/numBins of the total width
                    const binStartPercent = (binIndex / numBins) * 100;
                    const binWidthPercent = (1 / numBins) * 100;
                    const position = binStartPercent + (positionInBin * binWidthPercent);
                    
                    const isOutOfRange = termGradeStats.max > termGradeStats.min && (studentAvgTermGrade > termGradeStats.max || studentAvgTermGrade < termGradeStats.min);
                    
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: `${Math.max(0, Math.min(100, position))}%`,
                          transform: 'translateX(-50%)',
                          width: '3px',
                          height: '180px',
                          background: isOutOfRange ? '#ff6b6b' : '#2ecc71',
                          zIndex: 5,
                          boxShadow: isOutOfRange ? '0 0 10px rgba(255, 107, 107, 0.8)' : '0 0 10px rgba(46, 204, 113, 0.8)'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-30px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: isOutOfRange ? '#ff6b6b' : '#2ecc71',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          zIndex: 10
                        }}>
                          You: {studentAvgTermGrade.toFixed(1)}
                          {isOutOfRange && studentAvgTermGrade > termGradeStats.max && ' ⬆'}
                          {isOutOfRange && studentAvgTermGrade < termGradeStats.min && ' ⬇'}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* X-axis labels */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#888'
                }}>
                  {termGradeBins.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (!isAdmin || selectedStudent) ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          color: '#aaa'
        }}>
          No performance data available yet
        </div>
      ) : isAdmin && !selectedStudent && students.length === 0 && filterClass ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          color: '#aaa'
        }}>
          No students found in this class. Please select a different class.
        </div>
      ) : isAdmin && !filterClass ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          color: '#aaa'
        }}>
          Please select a class to view student overview.
        </div>
      ) : null}
    </div>
  );
};

export default StudentOverview;

