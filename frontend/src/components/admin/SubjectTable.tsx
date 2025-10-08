import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Subject {
  _id: string;
  department_id: string;
  subject_name: string;
  department_name?: string;
}

export interface Department {
  _id: string;
  department_name: string;
}

interface SubjectTableProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function SubjectTable({ onSuccess, onBack }: SubjectTableProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubjects();
      
      if (response.success) {
        const subjectData = (response.data as any).message || response.data;
        setSubjects(Array.isArray(subjectData) ? subjectData : []);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch subjects');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success) {
        const departmentData = (response.data as any).message || response.data;
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedDepartmentId) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await apiService.createSubject({
        subject_name: newSubjectName.trim(),
        department_id: selectedDepartmentId
      });

      if (response.success) {
        alert('Subject created successfully!');
        setNewSubjectName('');
        setSelectedDepartmentId('');
        fetchSubjects();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to create subject');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating subject:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const response = await apiService.deleteSubject(id);
      
      if (response.success) {
        alert('Subject deleted successfully!');
        fetchSubjects();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to delete subject');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting subject:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading subjects...</div>;
  }

  return (
    <div className="subject-table">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {onBack && (
            <button 
              className="btn btn--secondary"
              onClick={onBack}
            >
              ← Back to Academic Setup
            </button>
          )}
          <div>
            <h3>Subjects</h3>
            <p className="table-description">Define individual subjects and courses offered at the school.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Create Subject Form */}
      <div className="form-section">
        <h4>Add New Subject</h4>
        <form onSubmit={handleCreate} className="form-inline">
          <div className="form-group">
            <label htmlFor="subjectName">Subject Name *</label>
            <input
              type="text"
              id="subjectName"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              required
              placeholder="e.g., Algebra, Biology, Portuguese"
              disabled={isCreating}
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              required
              disabled={isCreating}
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.department_name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isCreating || !newSubjectName.trim() || !selectedDepartmentId}
          >
            {isCreating ? 'Adding...' : 'Add Subject'}
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="table-container">
        <h4>Existing Subjects</h4>
        {subjects.length === 0 ? (
          <p className="no-data">No subjects found. Add one above!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.subject_name}</td>
                  <td>{subject.department_name || 'Unknown'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="btn btn--danger btn--small"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
