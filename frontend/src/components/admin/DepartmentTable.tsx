import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Department {
  _id: string;
  department_name: string;
}

interface DepartmentTableProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function DepartmentTable({ onSuccess, onBack }: DepartmentTableProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments();
      
      if (response.success) {
        const departmentData = (response.data as any).message || response.data;
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch departments');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await apiService.createDepartment({
        department_name: newDepartmentName.trim()
      });

      if (response.success) {
        alert('Department created successfully!');
        setNewDepartmentName('');
        fetchDepartments();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to create department');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating department:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const response = await apiService.deleteDepartment(id);
      
      if (response.success) {
        alert('Department deleted successfully!');
        fetchDepartments();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to delete department');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting department:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="department-table">
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
            <h3>Departments</h3>
            <p className="table-description">Organize subjects into departments for better management.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Create Department Form */}
      <div className="form-section">
        <h4>Add New Department</h4>
        <form onSubmit={handleCreate} className="form-inline">
          <div className="form-group">
            <label htmlFor="departmentName">Department Name *</label>
            <input
              type="text"
              id="departmentName"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              required
              placeholder="e.g., Mathematics, Science, Languages"
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isCreating || !newDepartmentName.trim()}
          >
            {isCreating ? 'Adding...' : 'Add Department'}
          </button>
        </form>
      </div>

      {/* Departments List */}
      <div className="table-container">
        <h4>Existing Departments</h4>
        {departments.length === 0 ? (
          <p className="no-data">No departments found. Add one above!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department._id}>
                  <td>{department.department_name}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(department._id)}
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
