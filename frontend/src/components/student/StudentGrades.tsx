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
  subject_name: string;
  class_name: string;
  term_number: number;
  year_name: string;
  assessment_type_name: string;
}

const StudentGrades: React.FC = () => {
  const user = useUser();
  const [yearGrades, setYearGrades] = useState<StudentYearGrade[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load assignments (with grades) - show all with scores, regardless of status
      const assignmentsResp = await apiService.getStudentAssignments();
      let loadedAssignments: StudentAssignment[] = [];
      if (assignmentsResp.success && assignmentsResp.data) {
        const assignmentsData = (assignmentsResp.data as any)?.assignments || [];
        // Show assignments that have a score (regardless of status)
        loadedAssignments = assignmentsData.filter((sa: StudentAssignment) => sa.score !== null);
        setAssignments(loadedAssignments);
      }

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

      // Calculate year grades from assignments
      calculateYearGrades(loadedAssignments);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
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
    return yearGrades.filter(yg => {
      if (filterSubject && yg.subject_name !== filterSubject) return false;
      if (filterYear && yg.year_name !== filterYear) return false;
      return true;
    });
  };

  const getFilteredAssignments = () => {
    return assignments.filter(sa => {
      if (filterSubject && sa.subject_name !== filterSubject) return false;
      if (filterYear && sa.year_name !== filterYear) return false;
      return true;
    });
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

  const filteredYearGrades = getFilteredYearGrades();
  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="student-grades">
      <h2>My Grades</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        View your grades and academic performance across all subjects
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
            Subject:
          </label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '200px'
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject.subject_name}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

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
              <option key={year._id} value={year.year_name}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Year Averages Section */}
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
    </div>
  );
};

export default StudentGrades;

