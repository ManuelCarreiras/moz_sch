import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/apiService';
import StudentAssignmentCalendar from './StudentAssignmentCalendar';
import { useUser } from '../../contexts/AuthContext';

interface StudentAssignment {
  _id: string;
  student_id: string;
  student_name?: string;
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

type ViewMode = 'list' | 'calendar';

const StudentAssignments: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<StudentAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAssessmentType, setFilterAssessmentType] = useState<string>('');

  useEffect(() => {
    loadSubjects();
    loadSchoolYears();
    loadTerms();
    loadAssessmentTypes();
    if (isAdmin) {
      loadClasses();
    }
  }, []);

  useEffect(() => {
    // Reload assignments when filters change (for admin)
    if (isAdmin) {
      loadAssignments();
    }
  }, [filterYear, filterTerm, filterSubject, filterClass, filterStatus, filterAssessmentType]);

  useEffect(() => {
    // Load assignments on mount for students
    if (!isAdmin) {
      loadAssignments();
    }
  }, []);

  useEffect(() => {
    // Reload assignments when filters change (for students too - server-side filtering)
    if (!isAdmin && (filterYear || filterTerm || filterSubject || filterStatus || filterAssessmentType)) {
      loadAssignments();
    }
  }, [filterYear, filterTerm, filterSubject, filterStatus, filterAssessmentType]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isAdmin) {
        // Admin: Load ALL student assignments with server-side filters
        const params = new URLSearchParams();
        if (filterYear) params.append('year_id', filterYear);
        if (filterTerm) params.append('term_id', filterTerm);
        if (filterSubject) params.append('subject_id', filterSubject);
        if (filterClass) params.append('class_name', filterClass);
        if (filterStatus) params.append('status', filterStatus);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/student/assignments?${queryString}` : '/student/assignments';
        
        console.log('[StudentAssignments] Admin loading from:', endpoint);
        response = await apiService.get(endpoint);
        
        if (response.success && response.data) {
          const assignmentsData = (response.data as any)?.assignments || [];
          console.log('[StudentAssignments] Admin loaded:', assignmentsData.length, 'assignments');
          
          // For admin, deduplicate by assignment_id to show each assignment only once
          const uniqueAssignmentsMap = new Map<string, StudentAssignment>();
          assignmentsData.forEach((sa: StudentAssignment) => {
            const assignmentId = sa.assignment_id;
            if (!uniqueAssignmentsMap.has(assignmentId)) {
              uniqueAssignmentsMap.set(assignmentId, sa);
            }
          });
          const uniqueAssignments = Array.from(uniqueAssignmentsMap.values());
          
          console.log('[StudentAssignments] Unique assignments:', uniqueAssignments.length);
          setAssignments(uniqueAssignments);
          setFilteredAssignments(uniqueAssignments); // For admin, no client-side filtering
        }
      } else {
        // Student: Load only my assignments with filters
        const filters: any = {};
        if (filterYear) filters.year_id = filterYear;
        if (filterTerm) filters.term_id = filterTerm;
        if (filterSubject) filters.subject_id = filterSubject;
        if (filterStatus) filters.status = filterStatus;
        
        response = await apiService.getStudentAssignments(filters);
        if (response.success && response.data) {
          const assignmentsData = (response.data as any)?.assignments || [];
          setAssignments(assignmentsData);
          setFilteredAssignments(assignmentsData); // Set filtered directly for students too
        }
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await apiService.getClasses();
      if (response.success && response.data) {
        const allClasses = (response.data as any)?.message || [];
        // Extract unique class names
        const uniqueClasses = Array.from(
          new Map(allClasses.map((c: any) => [c.class_name, { class_id: c._id, class_name: c.class_name }])).values()
        );
        setClasses(uniqueClasses as ClassItem[]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
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

  const loadTerms = async () => {
    try {
      const response = await apiService.getTerms();
      if (response.success && response.data) {
        const allTerms = (response.data as any)?.message || [];
        setTerms(allTerms);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
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

  const getFilteredTerms = () => {
    if (!filterYear) return terms;
    return terms.filter(t => t.year_id === filterYear);
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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('student.assignments.loadingAssignments')}</div>;
  }

  return (
    <div className="student-assignments">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>{t('student.assignments.title')}</h2>
          <p>{t('student.assignments.subtitle')}</p>
        </div>
        
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            📋 {t('student.assignments.listView')}
          </button>
          <button
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 {t('student.assignments.calendarView')}
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>{t('common.schoolYear')}</label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterTerm('');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">{t('common.allYears')}</option>
            {schoolYears.map((year) => (
              <option key={year._id} value={year._id}>{year.year_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>{t('common.term')}</label>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            disabled={!filterYear}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              opacity: !filterYear ? 0.5 : 1
            }}
          >
            <option value="">{t('common.allTerms')}</option>
            {getFilteredTerms().map((term) => (
              <option key={term._id} value={term._id}>{t('common.termNumber', { number: term.term_number })}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>{t('common.subject')}</label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">{t('common.allSubjects')}</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.subject_name}</option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>{t('common.class')}</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
            >
              <option value="">{t('common.allClasses')}</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_name}>{cls.class_name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>{t('common.type')}</label>
          <select
            value={filterAssessmentType}
            onChange={(e) => setFilterAssessmentType(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">{t('common.allTypes')}</option>
            {assessmentTypes.map((type) => (
              <option key={type._id} value={type._id}>{type.type_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>{t('common.status')}</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">{t('common.allStatuses')}</option>
            <option value="not_submitted">{t('student.assignments.notSubmitted')}</option>
            <option value="submitted">{t('student.assignments.submitted')}</option>
            <option value="graded">{t('student.assignments.graded')}</option>
            <option value="late">{t('student.assignments.lateStatus')}</option>
          </select>
        </div>

        {(filterYear || filterTerm || filterSubject || filterClass || filterStatus || filterAssessmentType) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilterYear('');
                setFilterTerm('');
                setFilterSubject('');
                setFilterClass('');
                setFilterStatus('');
                setFilterAssessmentType('');
              }}
              style={{ width: '100%' }}
            >
              {t('common.clearFilters')}
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
                ? t('student.assignments.noAssignments')
                : t('student.assignments.noAssignmentsFilter')}
            </p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('student.assignments.assignmentCol')}</th>
                  <th>{t('student.assignments.subjectCol')}</th>
                  <th>{t('student.assignments.classCol')}</th>
                  <th>{t('student.assignments.typeCol')}</th>
                  <th>{t('student.assignments.dueDateCol')}</th>
                  <th>{t('student.assignments.statusCol')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((sa) => {
                  const daysUntil = getDaysUntilDue(sa.assignment.due_date);
                  const isOverdue = daysUntil !== null && daysUntil < 0;
                  const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
                  
                  return (
                    <tr key={sa.assignment_id} style={{ 
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
                              ? t('student.assignments.daysOverdue', { count: Math.abs(daysUntil) })
                              : daysUntil === 0 
                                ? t('student.assignments.dueToday')
                                : t('student.assignments.daysLeft', { count: daysUntil })}
                          </div>
                        )}
                      </td>
                      <td>{getStatusBadge(sa.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div style={{ marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
              {t('student.assignments.showingAssignments', { count: filteredAssignments.length, total: assignments.length })}
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

