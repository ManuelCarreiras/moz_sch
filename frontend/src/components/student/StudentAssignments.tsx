import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import StudentAssignmentCalendar from './StudentAssignmentCalendar';

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
    description?: string;
    subject_id: string;
    due_date?: string;
    max_score: number;
    weight: number;
    status: string;
  };
  subject_name?: string;
  class_name?: string;
  assessment_type_name?: string;
  term_number?: number;
  year_name?: string;
  year_id?: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
}

type ViewMode = 'list' | 'calendar';

const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<StudentAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadAssignments();
    loadSubjects();
    loadSchoolYears();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, filterYear, filterSubject, filterStatus]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudentAssignments();
      if (response.success && response.data) {
        const assignmentsData = (response.data as any)?.assignments || [];
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await apiService.getSubjects();
      if (response.success && response.data) {
        const subs = (response.data as any)?.message || [];
        setSubjects(Array.isArray(subs) ? subs : []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadSchoolYears = async () => {
    try {
      const response = await apiService.getSchoolYears();
      if (response.success && response.data) {
        const allYears = (response.data as any)?.message || [];
        const yearsArray = Array.isArray(allYears) ? allYears : [];
        
        // Show current and upcoming years only
        const now = new Date();
        const activeYears = yearsArray.filter((year: any) => {
          if (!year.end_date) return false;
          const endDate = new Date(year.end_date);
          return endDate >= now;
        });
        
        setSchoolYears(activeYears.length > 0 ? activeYears : yearsArray);
      }
    } catch (error) {
      console.error('Error loading school years:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...assignments];

    if (filterYear) {
      filtered = filtered.filter(a => a.year_id === filterYear);
    }

    if (filterSubject) {
      filtered = filtered.filter(a => a.assignment.subject_id === filterSubject);
    }

    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      not_submitted: { background: '#dc3545', color: '#fff' },
      submitted: { background: '#ffc107', color: '#000' },
      graded: { background: '#28a745', color: '#fff' },
      late: { background: '#e74c3c', color: '#fff' }
    };

    const labels: Record<string, string> = {
      not_submitted: 'Not Submitted',
      submitted: 'Submitted',
      graded: 'Graded',
      late: 'Late'
    };

    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 500,
        ...styles[status]
      }}>
        {labels[status] || status}
      </span>
    );
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading assignments...</div>;
  }

  return (
    <div className="student-assignments">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>My Assignments</h2>
          <p>Track your homework and project deadlines</p>
        </div>
        
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>School Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Years</option>
            {schoolYears.map((year) => (
              <option key={year._id} value={year._id}>{year.year_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>Subject</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.subject_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Statuses</option>
            <option value="not_submitted">Not Submitted</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="late">Late</option>
          </select>
        </div>

        {(filterYear || filterSubject || filterStatus) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilterYear('');
                setFilterSubject('');
                setFilterStatus('');
              }}
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* List View */
        filteredAssignments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px' 
          }}>
            <p style={{ fontSize: '1.1rem', color: '#ccc', marginBottom: '1rem' }}>
              {assignments.length === 0 
                ? "No assignments yet. Check back later!" 
                : "No assignments match your filters."}
            </p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((sa) => {
                  const daysUntil = getDaysUntilDue(sa.assignment.due_date);
                  const isOverdue = daysUntil !== null && daysUntil < 0;
                  const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
                  
                  return (
                    <tr key={sa._id} style={{ 
                      background: isOverdue ? 'rgba(220, 53, 69, 0.1)' : isDueSoon ? 'rgba(255, 193, 7, 0.1)' : undefined 
                    }}>
                      <td>
                        <strong>{sa.assignment.title}</strong>
                        {sa.assignment.description && (
                          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.25rem' }}>
                            {sa.assignment.description.substring(0, 60)}
                            {sa.assignment.description.length > 60 && '...'}
                          </div>
                        )}
                      </td>
                      <td>{sa.subject_name || '-'}</td>
                      <td>{sa.class_name || '-'}</td>
                      <td>{sa.assessment_type_name || '-'}</td>
                      <td>
                        <div>{formatDate(sa.assignment.due_date)}</div>
                        {daysUntil !== null && (
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: isOverdue ? '#dc3545' : isDueSoon ? '#ffc107' : '#28a745',
                            marginTop: '0.25rem'
                          }}>
                            {isOverdue 
                              ? `${Math.abs(daysUntil)} days overdue` 
                              : daysUntil === 0 
                                ? 'Due today!' 
                                : `${daysUntil} days left`}
                          </div>
                        )}
                      </td>
                      <td>
                        {sa.score !== null 
                          ? `${sa.score} / ${sa.assignment.max_score}` 
                          : '-'}
                      </td>
                      <td>{getStatusBadge(sa.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div style={{ marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </>
        )
      ) : (
        /* Calendar View */
        <StudentAssignmentCalendar assignments={filteredAssignments} />
      )}
    </div>
  );
};

export default StudentAssignments;

