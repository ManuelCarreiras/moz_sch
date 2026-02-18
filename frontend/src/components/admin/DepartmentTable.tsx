import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        setError(response.error || t('admin.departments.failedFetch'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
        alert(t('admin.departments.createSuccess'));
        setNewDepartmentName('');
        fetchDepartments();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.departments.failedCreate'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error creating department:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.departments.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteDepartment(id);
      
      if (response.success) {
        alert(t('admin.departments.deleteSuccess'));
        fetchDepartments();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.departments.failedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error deleting department:', err);
    }
  };

  if (loading) {
    return <div className="loading">{t('admin.departments.loadingDepartments')}</div>;
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
              {t('admin.departments.backToSetup')}
            </button>
          )}
          <div>
            <h3>{t('admin.departments.title')}</h3>
            <p className="table-description">{t('admin.departments.subtitle')}</p>
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
        <h4>{t('admin.departments.addNew')}</h4>
        <form onSubmit={handleCreate} className="form-inline">
          <div className="form-group">
            <label htmlFor="departmentName">{t('admin.departments.nameLabel')}</label>
            <input
              type="text"
              id="departmentName"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              required
              placeholder={t('admin.departments.namePlaceholder')}
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isCreating || !newDepartmentName.trim()}
          >
            {isCreating ? t('common.adding') : t('admin.departments.addDepartment')}
          </button>
        </form>
      </div>

      {/* Departments List */}
      <div className="table-container">
        <h4>{t('admin.departments.existing')}</h4>
        {departments.length === 0 ? (
          <p className="no-data">{t('admin.departments.noDepartments')}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.departments.departmentName')}</th>
                <th>{t('common.actions')}</th>
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
                      {t('common.delete')}
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
