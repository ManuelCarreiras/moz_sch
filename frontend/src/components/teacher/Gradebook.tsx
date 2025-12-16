import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/apiService';

interface Assignment {
  _id: string;
  title: string;
  max_score: number;
  due_date: string | null;
  assessment_type_name?: string;
  is_scored: boolean;
}

interface Grade {
  assignment_id: string;
  score: number | null;
  status: string;
  grade_id: string | null;
}

interface StudentRow {
  student_id: string;
  student_name: string;
  grades: Grade[];
  year_average: number | null; // 0-20 scale
  term_grade?: number | null; // 0-20 scale
}

interface GradebookData {
  class_id: string;
  class_name: string;
  assignments: Assignment[];
  students: StudentRow[];
  student_count: number;
  assignment_count: number;
}

interface AssessmentType {
  _id: string;
  type_name: string;
  is_scored: boolean;
}

interface GradebookProps {
  classId: string;
  termId?: string;
}

const Gradebook: React.FC<GradebookProps> = ({ classId, termId }) => {
  const [gradebook, setGradebook] = useState<GradebookData | null>(null);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [filterAssessmentType, setFilterAssessmentType] = useState<string>('');
  const [termGrades, setTermGrades] = useState<Map<string, number>>(new Map()); // student_id -> term_grade

  const loadTermGrades = useCallback(async () => {
    if (!termId || !classId) return;
    
    try {
      const response = await apiService.getTermGrades({
        class_id: classId,
        term_id: termId
      });
      
      if (response.success && response.data) {
        const grades = (response.data as any)?.term_grades || [];
        const gradeMap = new Map<string, number>();
        
        grades.forEach((grade: any) => {
          if (grade.student_id && grade.final_grade !== null && grade.final_grade !== undefined) {
            gradeMap.set(grade.student_id, parseFloat(grade.final_grade));
          }
        });
        
        setTermGrades(gradeMap);
      }
    } catch (error) {
      console.error('Error loading term grades:', error);
    }
  }, [termId, classId]);

  const loadGradebook = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGradebook(classId, termId);
      if (response.success && response.data) {
        setGradebook(response.data as GradebookData);
      } else {
        console.error('Error loading gradebook:', response.error);
      }
    } catch (error) {
      console.error('Error loading gradebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentTypes = async () => {
    try {
      const response = await apiService.getAssessmentTypes();
      if (response.success && response.data) {
        const typesData = (response.data as any)?.assessment_types || (response.data as any)?.message || response.data || [];
        setAssessmentTypes(Array.isArray(typesData) ? typesData : []);
      }
    } catch (error) {
      console.error('Error loading assessment types:', error);
    }
  };

  const getFilteredAssignments = () => {
    if (!gradebook?.assignments) return [];
    
    if (filterAssessmentType) {
      // Filter by assessment type based on type name
      const selectedType = assessmentTypes.find(t => t._id === filterAssessmentType);
      if (selectedType) {
        return gradebook.assignments.filter(a => a.assessment_type_name === selectedType.type_name);
      }
    }
    
    return gradebook.assignments;
  };

  useEffect(() => {
    loadGradebook();
    loadAssessmentTypes();
  }, [classId, termId]);

  useEffect(() => {
    if (termId && classId) {
      loadTermGrades();
    } else {
      setTermGrades(new Map());
    }
  }, [termId, classId, loadTermGrades]);
  
  useEffect(() => {
    // Auto-select first assignment when gradebook loads
    if (gradebook?.assignments && gradebook.assignments.length > 0 && !selectedAssignmentId) {
      const filteredAssignments = getFilteredAssignments();
      if (filteredAssignments.length > 0) {
        setSelectedAssignmentId(filteredAssignments[0]._id);
      }
    }
  }, [gradebook, filterAssessmentType]);

  const getGradeColor = (grade: number): string => {
    // Convert 0-20 scale to percentage for color coding
    const percentage = (grade / 20) * 100;
    if (percentage >= 80) return 'rgba(40, 167, 69, 0.2)'; // Green (16+/20)
    if (percentage >= 70) return 'rgba(23, 162, 184, 0.2)'; // Blue (14-15.9/20)
    if (percentage >= 60) return 'rgba(255, 193, 7, 0.2)'; // Yellow (12-13.9/20)
    return 'rgba(220, 53, 69, 0.2)'; // Red (<12/20)
  };

  const handleScoreChange = useCallback(async (
    studentId: string,
    assignmentId: string,
    newScore: string,
    maxScore: number
  ) => {
    // Validate score
    const score = newScore === '' ? null : parseFloat(newScore);
    
    if (score !== null && (isNaN(score) || score < 0 || score > maxScore)) {
      alert(`Please enter a valid score between 0 and ${maxScore}`);
      return;
    }

    setSaving(true);
    try {
      const gradeData = {
        student_id: studentId,
        assignment_id: assignmentId,
        score: score,
        status: score !== null ? 'graded' : 'not_submitted'
      };

      const response = await apiService.createOrUpdateGrade(gradeData);
      
      if (response.success) {
        // Reload gradebook to get updated averages
        await loadGradebook();
        // Reload term grades as they may have changed
        if (termId && classId) {
          await loadTermGrades();
        }
      } else {
        alert('Error saving grade: ' + (response.message || response.error));
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Error saving grade');
    } finally {
      setSaving(false);
      setEditingCell(null);
    }
  }, [classId, termId]);

  const handleCompletionToggle = useCallback(async (
    studentId: string,
    assignmentId: string,
    currentStatus: string,
    maxScore: number
  ) => {
    // Toggle: if graded → mark as not done, if not graded → mark as done
    const isDone = currentStatus === 'graded';
    
    setSaving(true);
    try {
      const gradeData = {
        student_id: studentId,
        assignment_id: assignmentId,
        score: isDone ? 0 : maxScore,  // Done = max_score (100%), Not done = 0
        status: isDone ? 'not_submitted' : 'graded'
      };

      const response = await apiService.createOrUpdateGrade(gradeData);
      
      if (response.success) {
        await loadGradebook();
      } else {
        alert('Error updating completion: ' + (response.message || response.error));
      }
    } catch (error) {
      console.error('Error updating completion:', error);
      alert('Error updating completion');
    } finally {
      setSaving(false);
    }
  }, [classId, termId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return '#28a745'; // Green
      case 'submitted': return '#ffc107'; // Yellow
      case 'late': return '#dc3545'; // Red
      case 'not_submitted':
      default: return '#6c757d'; // Gray
    }
  };

  const handleStatusChange = useCallback(async (
    studentId: string,
    assignmentId: string,
    newStatus: string
  ) => {
    setSaving(true);
    try {
      const gradeData = {
        student_id: studentId,
        assignment_id: assignmentId,
        status: newStatus
      };

      const response = await apiService.createOrUpdateGrade(gradeData);
      
      if (response.success) {
        await loadGradebook();
        // Reload term grades as they may have changed
        if (termId && classId) {
          await loadTermGrades();
        }
      } else {
        alert('Error updating status: ' + (response.message || response.error));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setSaving(false);
    }
  }, [classId, termId]);

  if (loading) {
    return <div>Loading gradebook...</div>;
  }

  if (!gradebook) {
    return <div>No gradebook data available</div>;
  }

  // Get selected assignment
  const selectedAssignment = gradebook?.assignments.find(a => a._id === selectedAssignmentId);
  
  // Get assignment index for grades array
  const assignmentIndex = gradebook?.assignments.findIndex(a => a._id === selectedAssignmentId) ?? -1;

  return (
    <div className="gradebook">
      <div className="gradebook-header">
        <h2>{gradebook.class_name} - Gradebook</h2>
        <p style={{ color: 'var(--muted)' }}>
          {gradebook.student_count} students × {gradebook.assignment_count} assignments
          {saving && <span style={{ marginLeft: '1rem', color: '#ffc107' }}>Saving...</span>}
        </p>
      </div>

      {/* Filters */}
      {gradebook.assignment_count > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: 'var(--text)',
              fontSize: '0.9rem'
            }}>
              Filter by Type:
            </label>
            <select
              value={filterAssessmentType}
              onChange={(e) => {
                setFilterAssessmentType(e.target.value);
                setSelectedAssignmentId('');
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                fontSize: '1rem'
              }}
            >
              <option value="">All Types</option>
              {assessmentTypes.map((type) => (
                <option key={type._id} value={type._id}>{type.type_name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '2', minWidth: '300px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: 'var(--text)',
              fontSize: '0.9rem'
            }}>
              Select Assignment:
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Select Assignment --</option>
              {getFilteredAssignments().map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title} (Max: {assignment.max_score})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Student List for Selected Assignment */}
      {selectedAssignment && assignmentIndex >= 0 ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>
            {selectedAssignment.title}
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)', marginLeft: '1rem' }}>
              Max: {selectedAssignment.max_score}
            </span>
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', minWidth: '200px' }}>Student</th>
                  <th style={{ padding: '1rem', textAlign: 'center', minWidth: '150px' }}>Score</th>
                  <th style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>Percentage</th>
                  <th style={{ padding: '1rem', textAlign: 'center', minWidth: '120px' }}>Status</th>
                  {termId && (
                    <th style={{ padding: '1rem', textAlign: 'center', minWidth: '140px', background: 'rgba(0, 123, 255, 0.1)' }}>
                      Term Grade
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {gradebook.students.length === 0 ? (
                  <tr>
                    <td colSpan={termId ? 5 : 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No students enrolled in this class
                    </td>
                  </tr>
                ) : (
                  gradebook.students.map((student) => {
                    const grade = student.grades[assignmentIndex];
                    const isEditing = editingCell?.studentId === student.student_id && 
                                    editingCell?.assignmentId === grade.assignment_id;
                    const percentage = grade.score !== null ? ((grade.score / selectedAssignment.max_score) * 100).toFixed(1) : null;
                    const termGrade = termGrades.get(student.student_id);
                    
                    return (
                      <tr key={student.student_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text)' }}>
                          {student.student_name}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                            cursor: !selectedAssignment.is_scored ? 'default' : 'pointer'
                          }}
                          onClick={() => {
                            if (selectedAssignment.is_scored) {
                              setEditingCell({ 
                                studentId: student.student_id, 
                                assignmentId: grade.assignment_id 
                              });
                            }
                          }}
                        >
                          {!selectedAssignment.is_scored ? (
                            // Completion checkbox for homework
                            <input
                              type="checkbox"
                              checked={grade.status === 'graded'}
                              onChange={() => handleCompletionToggle(
                                student.student_id,
                                grade.assignment_id,
                                grade.status,
                                selectedAssignment.max_score
                              )}
                              style={{
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer'
                              }}
                            />
                          ) : isEditing ? (
                            // Score input for tests
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max={selectedAssignment.max_score}
                              defaultValue={grade.score || ''}
                              autoFocus
                              onBlur={(e) => handleScoreChange(
                                student.student_id,
                                grade.assignment_id,
                                e.target.value,
                                selectedAssignment.max_score
                              )}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleScoreChange(
                                    student.student_id,
                                    grade.assignment_id,
                                    e.currentTarget.value,
                                    selectedAssignment.max_score
                                  );
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                              style={{
                                width: '100%',
                                border: '2px solid #007bff',
                                padding: '0.5rem',
                                textAlign: 'center',
                                background: 'var(--card)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
                              {!selectedAssignment.is_scored ? (
                                // Show completion status for homework
                                grade.status === 'graded' ? '✓ Done' : '○ Not Done'
                              ) : (
                                // Show score for tests
                                grade.score !== null ? (
                                  <span>{grade.score} / {selectedAssignment.max_score}</span>
                                ) : (
                                  <span style={{ color: 'var(--muted)' }}>Not graded</span>
                                )
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text)' }}>
                          {!selectedAssignment.is_scored ? (
                            // Show 100% or 0% for homework completion
                            grade.status === 'graded' ? '100%' : '0%'
                          ) : (
                            // Show actual percentage for tests
                            percentage !== null ? `${percentage}%` : '-'
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <select
                            value={grade.status}
                            onChange={(e) => handleStatusChange(student.student_id, grade.assignment_id, e.target.value)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              background: getStatusColor(grade.status),
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="not_submitted" style={{ background: '#6c757d', color: 'white' }}>Not Submitted</option>
                            <option value="submitted" style={{ background: '#ffc107', color: 'white' }}>Submitted</option>
                            <option value="graded" style={{ background: '#28a745', color: 'white' }}>Graded</option>
                            <option value="late" style={{ background: '#dc3545', color: 'white' }}>Late</option>
                          </select>
                        </td>
                        {termId && (
                          <td style={{ 
                            padding: '1rem', 
                            textAlign: 'center',
                            background: termGrade !== undefined && termGrade !== null 
                              ? getGradeColor(termGrade) 
                              : 'transparent'
                          }}>
                            {termGrade !== undefined && termGrade !== null ? (
                              <div style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: 700, 
                                color: 'var(--text)'
                              }}>
                                {termGrade.toFixed(2)} / 20
                              </div>
                            ) : (
                              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                                Not calculated
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: 'var(--card)',
          borderRadius: '8px',
          color: 'var(--muted)',
          marginTop: '1.5rem'
        }}>
          {gradebook.assignment_count === 0 ? 'No assignments found for this class' : 'Please select an assignment to view grades'}
        </div>
      )}

      <div className="gradebook-legend" style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: 'var(--card)', 
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong style={{ color: 'var(--text)' }}>How Grading Works:</strong>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              • Each assignment has a max score and weight<br/>
              • Term grade is calculated on a 0-20 scale using grading criteria<br/>
              • Weighted by tests, homework, and attendance<br/>
              • Updates automatically when you enter grades
            </div>
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Cell Colors:</strong>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span><span style={{ background: '#d4edda', padding: '0.25rem 0.5rem', color: '#155724' }}>90-100%</span></span>
              <span><span style={{ background: '#d1ecf1', padding: '0.25rem 0.5rem', color: '#0c5460' }}>80-89%</span></span>
              <span><span style={{ background: '#fff3cd', padding: '0.25rem 0.5rem', color: '#856404' }}>70-79%</span></span>
              <span><span style={{ background: '#f8d7da', padding: '0.25rem 0.5rem', color: '#721c24' }}>&lt;70%</span></span>
              <span><span style={{ background: '#3a3a3a', padding: '0.25rem 0.5rem', color: '#aaa' }}>Not graded</span></span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
          <strong style={{ color: 'var(--text)' }}>💡 Tip:</strong> Click any cell to enter a score. Press <kbd>Enter</kbd> to save, <kbd>Escape</kbd> to cancel.
        </div>
      </div>
    </div>
  );
};

export default Gradebook;

