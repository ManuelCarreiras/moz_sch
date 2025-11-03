import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import AssignmentWizard from './AssignmentWizard';

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
  weight: number;
  status: string;
  created_date?: string;
}

const AssignmentList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, filterStatus, filterClass]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeacherAssignments();
      if (response.success && response.data) {
        const assignmentsData = (response.data as any)?.assignments || response.data || [];
        setAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assignments];

    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (filterClass) {
      filtered = filtered.filter(a => a.class_id === filterClass);
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
    const classMap = new Map();
    assignments.forEach(a => {
      if (a.class_id && !classMap.has(a.class_id)) {
        classMap.set(a.class_id, a.class_name || a.class_id);
      }
    });
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Filter by Class</label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Classes</option>
            {getUniqueClasses().map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {(filterStatus || filterClass) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
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
          background: '#f8f9fa', 
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
                <td>{assignment.class_name || '-'}</td>
                <td>{assignment.assessment_type_name || '-'}</td>
                <td>{formatDate(assignment.due_date)}</td>
                <td>{assignment.max_score}</td>
                <td>{assignment.weight}%</td>
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

