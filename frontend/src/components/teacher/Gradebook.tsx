import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/apiService';

interface Assignment {
  _id: string;
  title: string;
  max_score: number;
  weight: number;
  due_date: string | null;
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
  term_average: number | null;
  letter_grade: string | null;
}

interface GradebookData {
  class_id: string;
  class_name: string;
  assignments: Assignment[];
  students: StudentRow[];
  student_count: number;
  assignment_count: number;
}

interface GradebookProps {
  classId: string;
  termId?: string;
}

const Gradebook: React.FC<GradebookProps> = ({ classId, termId }) => {
  const [gradebook, setGradebook] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null);

  useEffect(() => {
    loadGradebook();
  }, [classId, termId]);

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

  const handleScoreChange = useCallback(async (
    studentId: string,
    assignmentId: string,
    newScore: string
  ) => {
    // Validate score
    const score = newScore === '' ? null : parseFloat(newScore);
    
    if (score !== null && (isNaN(score) || score < 0)) {
      alert('Please enter a valid score (0 or greater)');
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

  const getCellColor = (score: number | null, maxScore: number) => {
    if (score === null) return '#f0f0f0'; // Gray for ungraded
    
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return '#d4edda'; // Green (A)
    if (percentage >= 80) return '#d1ecf1'; // Blue (B)
    if (percentage >= 70) return '#fff3cd'; // Yellow (C)
    return '#f8d7da'; // Red (D/F)
  };

  if (loading) {
    return <div>Loading gradebook...</div>;
  }

  if (!gradebook) {
    return <div>No gradebook data available</div>;
  }

  return (
    <div className="gradebook">
      <div className="gradebook-header">
        <h2>{gradebook.class_name} - Gradebook</h2>
        <p>
          {gradebook.student_count} students × {gradebook.assignment_count} assignments
          {saving && <span style={{ marginLeft: '1rem', color: '#ffc107' }}>Saving...</span>}
        </p>
      </div>

      <div className="gradebook-table-container" style={{ overflowX: 'auto' }}>
        <table className="gradebook-table" style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'white', zIndex: 2, minWidth: '150px' }}>
                Student
              </th>
              {gradebook.assignments.map((assignment) => (
                <th key={assignment._id} style={{ minWidth: '100px', textAlign: 'center' }}>
                  <div>
                    <strong>{assignment.title}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    Max: {assignment.max_score} | Weight: {assignment.weight}%
                  </div>
                </th>
              ))}
              <th style={{ minWidth: '120px', textAlign: 'center', background: '#f8f9fa' }}>
                <strong>Term Average</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {gradebook.students.length === 0 ? (
              <tr>
                <td colSpan={gradebook.assignments.length + 2} style={{ textAlign: 'center', padding: '2rem' }}>
                  No students enrolled in this class
                </td>
              </tr>
            ) : (
              gradebook.students.map((student) => (
                <tr key={student.student_id}>
                  <td style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1, fontWeight: 500 }}>
                    {student.student_name}
                  </td>
                  {student.grades.map((grade, idx) => {
                    const assignment = gradebook.assignments[idx];
                    const isEditing = editingCell?.studentId === student.student_id && 
                                    editingCell?.assignmentId === grade.assignment_id;
                    
                    return (
                      <td
                        key={grade.assignment_id}
                        style={{
                          textAlign: 'center',
                          background: getCellColor(grade.score, assignment.max_score),
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                        onClick={() => setEditingCell({ 
                          studentId: student.student_id, 
                          assignmentId: grade.assignment_id 
                        })}
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={assignment.max_score}
                            defaultValue={grade.score || ''}
                            autoFocus
                            onBlur={(e) => handleScoreChange(
                              student.student_id,
                              grade.assignment_id,
                              e.target.value
                            )}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleScoreChange(
                                  student.student_id,
                                  grade.assignment_id,
                                  e.currentTarget.value
                                );
                              } else if (e.key === 'Escape') {
                                setEditingCell(null);
                              }
                            }}
                            style={{
                              width: '100%',
                              border: '2px solid #007bff',
                              padding: '0.25rem',
                              textAlign: 'center'
                            }}
                          />
                        ) : (
                          <div>
                            {grade.score !== null ? (
                              <span>{grade.score}</span>
                            ) : (
                              <span style={{ color: '#999' }}>-</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ 
                    textAlign: 'center', 
                    background: '#f8f9fa', 
                    fontWeight: 600 
                  }}>
                    {student.term_average !== null ? (
                      <div>
                        <div>{student.term_average.toFixed(2)}%</div>
                        {student.letter_grade && (
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            ({student.letter_grade})
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="gradebook-legend" style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '4px' 
      }}>
        <strong>Legend:</strong>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span><span style={{ background: '#d4edda', padding: '0.25rem 0.5rem' }}>90-100%</span> A</span>
          <span><span style={{ background: '#d1ecf1', padding: '0.25rem 0.5rem' }}>80-89%</span> B</span>
          <span><span style={{ background: '#fff3cd', padding: '0.25rem 0.5rem' }}>70-79%</span> C</span>
          <span><span style={{ background: '#f8d7da', padding: '0.25rem 0.5rem' }}>&lt;70%</span> D/F</span>
          <span><span style={{ background: '#f0f0f0', padding: '0.25rem 0.5rem' }}>-</span> Not graded</span>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          <strong>Tip:</strong> Click any cell to enter a score. Press Enter to save, Escape to cancel.
        </div>
      </div>
    </div>
  );
};

export default Gradebook;

