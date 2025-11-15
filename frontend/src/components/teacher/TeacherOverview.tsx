import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface StudentPerformance {
  student_id: string;
  student_name: string;
  homework_completion_ratio: number;
  attendance_ratio: number;
  test_average: number;
  test_count: number;
  test_total: number;
  term_grade_average?: number | null; // 0-20 scale
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

const TeacherOverview: React.FC = () => {
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [testScores, setTestScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  
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
    loadStudents();
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
    if (!filterYear) return;
    
    try {
      const response = await apiService.getTerms();
      if (response.success && response.data) {
        const allTerms = (response.data as any)?.message || [];
        const termsArray = Array.isArray(allTerms) ? allTerms : [];
        const filteredTerms = termsArray.filter((term: Term) => term.year_id === filterYear);
        setTerms(filteredTerms);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await apiService.get('/teacher/schedule');
      if (response.success && response.data) {
        const responseData = (response.data as any)?.message || response.data;
        const classData = responseData?.timetable || [];
        
        let filteredClasses = classData;
        if (filterYear) {
          filteredClasses = filteredClasses.filter((cls: any) => cls.year_id === filterYear);
        }
        if (filterTerm) {
          filteredClasses = filteredClasses.filter((cls: any) => cls.term_id === filterTerm);
        }
        if (filterSubject) {
          filteredClasses = filteredClasses.filter((cls: any) => cls.subject_id === filterSubject);
        }
        
        const uniqueClassesMap = new Map<string, TeacherClass>();
        filteredClasses.forEach((cls: any) => {
          const key = cls.class_name;
          if (!uniqueClassesMap.has(key)) {
            uniqueClassesMap.set(key, {
              _id: cls._id,
              class_name: cls.class_name,
              subject_id: cls.subject_id,
              term_id: cls.term_id
            });
          }
        });
        
        const uniqueClasses = Array.from(uniqueClassesMap.values());
        uniqueClasses.sort((a, b) => a.class_name.localeCompare(b.class_name));
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      if (filterSubject) params.append('subject_id', filterSubject);
      if (filterClass) {
        const selectedClass = classes.find(c => c._id === filterClass);
        if (selectedClass) {
          params.append('class_name', selectedClass.class_name);
        }
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `/teacher/students?${queryString}` : '/teacher/students';
      
      const response = await apiService.get(endpoint);
      if (response.success && response.data) {
        const studentsData = (response.data as any)?.students || [];
        const scores = (response.data as any)?.test_scores || [];
        setStudents(studentsData);
        setTestScores(scores);
      } else {
        setStudents([]);
        setTestScores([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate averages
  const avgHomework = students.length > 0
    ? students.reduce((sum, s) => sum + s.homework_completion_ratio, 0) / students.length
    : 0;
  
  const avgAttendance = students.length > 0
    ? students.reduce((sum, s) => sum + s.attendance_ratio, 0) / students.length
    : 0;
  
  const avgTestScore = students.length > 0
    ? students.reduce((sum, s) => sum + s.test_average, 0) / students.length
    : 0;
  
  // Calculate average term grade (on 0-20 scale)
  const studentsWithTermGrades = students.filter(s => s.term_grade_average !== null && s.term_grade_average !== undefined);
  const avgTermGrade = studentsWithTermGrades.length > 0
    ? studentsWithTermGrades.reduce((sum, s) => sum + (s.term_grade_average || 0), 0) / studentsWithTermGrades.length
    : 0;

  // Use test scores from state (already loaded from API)

  // Calculate comprehensive statistics for test scores
  const testScoreStats = testScores.length > 0 ? (() => {
    const sorted = [...testScores].sort((a, b) => a - b);
    const mean = testScores.reduce((a, b) => a + b, 0) / testScores.length;
    const variance = testScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / testScores.length;
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
      min: Math.min(...testScores),
      max: Math.max(...testScores),
      q1,
      q3,
      count: testScores.length
    };
  })() : { 
    mean: 0, median: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0, count: 0 
  };

  // Create histogram data (bins: 0-20, 20-40, 40-60, 60-80, 80-100)
  const bins = [0, 20, 40, 60, 80, 100];
  const histogram = bins.slice(0, -1).map((min, i) => {
    const max = bins[i + 1];
    const count = testScores.filter(score => score >= min && score < max).length;
    return { min, max, count, percentage: testScores.length > 0 ? (count / testScores.length) * 100 : 0 };
  });


  const CircularProgress: React.FC<{ value: number; max: number; label: string; isTermGrade?: boolean }> = ({ value, max, label, isTermGrade = false }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Determine color based on percentage (for 0-20 scale, use same thresholds as 0-100%)
    const getColor = () => {
      if (percentage >= 80) return '#28a745'; // Green (16+/20 or 80+/100%)
      if (percentage >= 60) return '#ffc107'; // Yellow (12-15.9/20 or 60-79/100%)
      if (percentage >= 40) return '#ff9800'; // Orange (8-11.9/20 or 40-59/100%)
      return '#dc3545'; // Red (<8/20 or <40/100%)
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
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="12"
            />
            {/* Progress circle */}
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
          {/* Center text */}
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
    <div className="teacher-overview" style={{ paddingBottom: '2rem', overflow: 'visible' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Overview</h2>
        <p>View summarized performance metrics for your students</p>
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
            onChange={(e) => setFilterClass(e.target.value)}
            disabled={!filterYear || (!filterTerm && !filterSubject)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.class_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Gauges */}
      {students.length > 0 ? (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem', 
            marginBottom: '2rem' 
          }}>
            <CircularProgress value={avgHomework} max={100} label="Avg Homework Completion" />
            <CircularProgress value={avgAttendance} max={100} label="Avg Attendance Ratio" />
            <CircularProgress value={avgTestScore} max={100} label="Avg Test Score" />
            {avgTermGrade > 0 && (
              <CircularProgress value={avgTermGrade} max={20} label="Avg Term Grade" isTermGrade={true} />
            )}
          </div>

          {/* Test Score Distribution */}
          {testScores.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '1.5rem',
              overflow: 'visible'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.5rem' }}>Test Score Distribution</h3>
              
              {/* Enhanced Statistics */}
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
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2ecc71' }}>
                    {testScoreStats.count}
                  </div>
                </div>
              </div>

              {/* Score Distribution Chart */}
              <div style={{ position: 'relative', padding: '1.5rem 1rem 3rem 1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', overflow: 'visible' }}>
                {/* Histogram */}
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
                        title={bin.count > 0 ? `${bin.count} ${bin.count === 1 ? 'score' : 'scores'} in range ${bin.min}-${bin.max}%` : `No scores in range ${bin.min}-${bin.max}%`}
                      >
                        {/* Count label on hover - using React state would be better but this works */}
                        {bin.count > 0 && (
                          <div 
                            className="histogram-tooltip"
                            style={{
                              position: 'absolute',
                              bottom: `${barHeight + 8}px`,
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              color: '#fff',
                              background: 'rgba(0, 0, 0, 0.8)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              pointerEvents: 'none',
                              zIndex: 10
                            }}
                          >
                            {bin.count}
                          </div>
                        )}
                        
                        {/* Bar */}
                        <div 
                          style={{ 
                            width: '100%', 
                            background: barColor,
                            height: `${barHeight}px`,
                            minHeight: bin.count > 0 ? '4px' : '0',
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.3s ease',
                            opacity: bin.count > 0 ? 0.8 : 0.2,
                            boxShadow: bin.count > 0 ? `0 2px 8px ${barColor}40` : 'none',
                            border: `1px solid ${barColor}80`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scaleY(1.05)';
                            e.currentTarget.style.transformOrigin = 'bottom';
                            const tooltip = e.currentTarget.parentElement?.querySelector('.histogram-tooltip') as HTMLElement;
                            if (tooltip) tooltip.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = bin.count > 0 ? '0.8' : '0.2';
                            e.currentTarget.style.transform = 'scaleY(1)';
                            const tooltip = e.currentTarget.parentElement?.querySelector('.histogram-tooltip') as HTMLElement;
                            if (tooltip) tooltip.style.opacity = '0';
                          }}
                        />
                        
                        {/* X-axis label */}
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.75rem', 
                          color: '#aaa',
                          textAlign: 'center',
                          fontWeight: 500
                        }}>
                          {bin.min}-{bin.max}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
            Showing metrics for {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px' 
        }}>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            {loading ? 'Loading data...' : 'No students found. Try adjusting your filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherOverview;

