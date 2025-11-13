import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import AssignmentWizard from './AssignmentWizard';
// import AssignmentWizard from './AssignmentWizardSimple';

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  subject_id: string;
  subject_name?: string;
  class_id: string;
  class_name?: string;
  assessment_type_id: string;
  assessment_type_name?: string;
  term_id: string;
  term_number?: number;
  due_date?: string;
  max_score: number;
  status: string;
  created_date?: string;
}

interface TeacherClass {
  _id: string;
  class_name: string;
  subject_id?: string;
  subject_name?: string;
  term_id?: string;
  year_id?: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date?: string;
  end_date?: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

const AssignmentList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [availableClasses, setAvailableClasses] = useState<TeacherClass[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  // Filters - Default to empty (show all)
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');

  useEffect(() => {
    loadAssignments();
    loadAvailableClasses();
    loadSchoolYears();
    loadSubjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, filterYear, filterSubject, filterStatus, filterClass]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      console.log('Loading assignments...');
      const response = await apiService.getTeacherAssignments();
      console.log('Assignments response:', response);
      
      if (response.success && response.data) {
        const assignmentsData = (response.data as any)?.assignments || response.data || [];
        console.log('Parsed assignments:', assignmentsData);
        setAssignments(assignmentsData);
      } else {
        console.error('Failed to load assignments:', response);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableClasses = async () => {
    try {
      const response = await apiService.get('/teacher/schedule');
      if (response.success && response.data) {
        const responseData = (response.data as any)?.message || response.data;
        const classData = responseData?.timetable || [];
        
        // Extract unique classes by class_name + subject_id combination
        const uniqueClasses = new Map<string, TeacherClass>();
        classData.forEach((cls: any) => {
          const key = `${cls.class_name}-${cls.subject_id}`;
          if (!uniqueClasses.has(key)) {
            uniqueClasses.set(key, {
              _id: cls._id,
              class_name: cls.class_name,
              subject_id: cls.subject_id,
              subject_name: cls.subject_name,
              term_id: cls.term_id,
              year_id: cls.year_id
            });
          }
        });
        
        setAvailableClasses(Array.from(uniqueClasses.values()));
      }
    } catch (error) {
      console.error('Error loading available classes:', error);
    }
  };

  const loadSchoolYears = async () => {
    try {
      const response = await apiService.getSchoolYears();
      if (response.success && response.data) {
        const allYears = (response.data as any)?.message || [];
        const yearsArray = Array.isArray(allYears) ? allYears : [];
        
        // Show current/upcoming year only
        const now = new Date();
        const activeYears = yearsArray.filter((year: SchoolYear) => {
          if (!year.start_date || !year.end_date) return false;
          const endDate = new Date(year.end_date);
          return endDate >= now; // Show if year hasn't ended yet
        });
        
        setSchoolYears(activeYears.length > 0 ? activeYears : yearsArray);
      }
    } catch (error) {
      console.error('Error loading school years:', error);
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

  const applyFilters = () => {
    let filtered = [...assignments];

    // Filter by year (check if assignment's term belongs to selected year)
    if (filterYear) {
      filtered = filtered.filter(_a => {
        // Need to check if assignment's term_id belongs to the selected year
        // For now, we'll need to add year info to assignments from backend
        // Placeholder: filter by term year
        return true; // TODO: Add year filtering when assignment includes term details
      });
    }

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(a => a.subject_id === filterSubject);
    }

    // Filter by class (match by class_name and subject_id combination)
    if (filterClass) {
      // Find the selected class from availableClasses to get its class_name and subject_id
      const selectedClass = availableClasses.find(c => c._id === filterClass);
      if (selectedClass) {
        filtered = filtered.filter(a => 
          a.class_name === selectedClass.class_name && 
          a.subject_id === selectedClass.subject_id
        );
      }
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowWizard(true);
  };

  const handleDelete = async (assignment: Assignment) => {
    if (!window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteAssignment(assignment._id);
      if (response.success) {
        alert('Assignment deleted successfully!');
        loadAssignments();
      } else {
        alert('Error: ' + (response.message || response.error || 'Failed to delete assignment'));
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment');
    }
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setEditingAssignment(null);
  };

  const getUniqueClasses = () => {
    // Use availableClasses loaded from teacher schedule
    let classes = availableClasses;
    
    // Filter by subject if selected
    if (filterSubject) {
      classes = classes.filter(cls => cls.subject_id === filterSubject);
    }
    
    // Filter by year if selected
    if (filterYear) {
      classes = classes.filter(cls => cls.year_id === filterYear);
    }
    
    // Further deduplicate by class_name only (no need to show subject since it's already filtered)
    const uniqueByName = new Map<string, TeacherClass>();
    classes.forEach(cls => {
      if (!uniqueByName.has(cls.class_name)) {
        uniqueByName.set(cls.class_name, cls);
      }
    });
    
    return Array.from(uniqueByName.values()).map(cls => ({ 
      id: cls._id, 
      name: cls.class_name  // Just show class name, no subject
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      draft: { background: '#ffc107', color: '#000' },
      published: { background: '#28a745', color: '#fff' },
      closed: { background: '#6c757d', color: '#fff' }
    };

    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 500,
        ...styles[status]
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <div className="assignment-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>My Assignments</h2>
          <p>Manage your assignments and assessments</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowWizard(true)}
        >
          + Create Assignment
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
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
            onChange={(e) => {
              setFilterYear(e.target.value);
              // Reset class filter when year changes
              if (filterClass) setFilterClass('');
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>Subject</label>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              // Reset class filter when subject changes
              if (filterClass) setFilterClass('');
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>Class</label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Classes</option>
            {getUniqueClasses().map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {(filterYear || filterSubject || filterStatus || filterClass) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilterYear('');
                setFilterSubject('');
                setFilterStatus('');
                setFilterClass('');
              }}
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px' 
        }}>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
            {assignments.length === 0 
              ? "You haven't created any assignments yet." 
              : "No assignments match your filters."}
          </p>
          {assignments.length === 0 && (
            <button
              className="btn btn-primary"
              onClick={() => setShowWizard(true)}
            >
              Create Your First Assignment
            </button>
          )}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Type</th>
              <th>Due Date</th>
              <th>Max Score</th>
              <th>Weight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map((assignment) => (
              <tr key={assignment._id}>
                <td>
                  <strong>{assignment.title}</strong>
                  {assignment.description && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {assignment.description.substring(0, 60)}
                      {assignment.description.length > 60 && '...'}
                    </div>
                  )}
                </td>
                <td>{assignment.subject_name || '-'}</td>
                <td>{assignment.class_name || '-'}</td>
                <td>{assignment.assessment_type_name || '-'}</td>
                <td>{formatDate(assignment.due_date)}</td>
                <td>{assignment.max_score}</td>
                <td>{getStatusBadge(assignment.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(assignment)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(assignment)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
        Showing {filteredAssignments.length} of {assignments.length} assignments
      </div>

      {showWizard && (
        <AssignmentWizard
          onClose={handleCloseWizard}
          onSuccess={loadAssignments}
          editingAssignment={editingAssignment}
        />
      )}
    </div>
  );
};

export default AssignmentList;

