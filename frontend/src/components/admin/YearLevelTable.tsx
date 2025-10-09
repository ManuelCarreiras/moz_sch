import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface YearLevelTableProps {
  onBack: () => void;
}

interface YearLevel {
  _id: string;
  level_name: string;
  level_order: number;
}

export function YearLevelTable({ onBack }: YearLevelTableProps) {
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingYearLevel, setEditingYearLevel] = useState<YearLevel | null>(null);
  const [formData, setFormData] = useState({
    level_name: '',
    level_order: ''
  });

  useEffect(() => {
    loadYearLevels();
  }, []);

  const loadYearLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getYearLevels();
      
      if (response.success) {
        const yearLevelData = (response.data as any)?.message || response.data;
        setYearLevels(Array.isArray(yearLevelData) ? yearLevelData : []);
      } else {
        setError(response.error || 'Failed to load year levels');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading year levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level_name' ? value.toUpperCase() : (name === 'level_order' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.level_name || !formData.level_order) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const submitData = {
        level_name: formData.level_name,
        level_order: parseInt(formData.level_order.toString())
      };

      if (editingYearLevel) {
        await apiService.updateYearLevel(editingYearLevel._id, submitData);
        alert('Year level updated successfully!');
      } else {
        await apiService.createYearLevel(submitData);
        alert('Year level created successfully!');
      }

      setShowForm(false);
      setEditingYearLevel(null);
      setFormData({ level_name: '', level_order: '' });
      loadYearLevels();
    } catch (err) {
      console.error('Error saving year level:', err);
      alert('Failed to save year level');
    }
  };

  const handleEdit = (yearLevel: YearLevel) => {
    setEditingYearLevel(yearLevel);
    setFormData({
      level_name: yearLevel.level_name,
      level_order: yearLevel.level_order.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this year level?')) {
      return;
    }

    try {
      await apiService.deleteYearLevel(id);
      alert('Year level deleted successfully!');
      loadYearLevels();
    } catch (err) {
      console.error('Error deleting year level:', err);
      alert('Failed to delete year level');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingYearLevel(null);
    setFormData({ level_name: '', level_order: '' });
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          Loading year levels...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button onClick={onBack} className="btn btn--secondary">
          ← Back to School Year Management
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2>Year Levels Management</h2>
          <p className="table-description">
            Manage grade levels with letters (A, B, C) and grade levels (1st Grade to 9th Grade) for academic organization.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn--primary"
        >
          Add Year Level
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="modal" role="dialog" aria-modal="true" onClick={handleCancel}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editingYearLevel ? 'Edit Year Level' : 'Add New Year Level'}</h2>
              <button onClick={handleCancel} className="icon-btn" aria-label="Close">✕</button>
            </div>

            <div className="modal__content">
              <form onSubmit={handleSubmit} className="student-form">
              <div className="form-group">
                <label htmlFor="level_name">Level Name *</label>
                <input
                  type="text"
                  id="level_name"
                  name="level_name"
                  value={formData.level_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., A, B, C"
                  maxLength={1}
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                  Single letter (A, B, C, D, etc.)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="level_order">Grade Level *</label>
                <select
                  id="level_order"
                  name="level_order"
                  value={formData.level_order}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="1">1st Grade</option>
                  <option value="2">2nd Grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                  <option value="9">9th Grade</option>
                </select>
                <small style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                  Select the grade level (1st Grade to 9th Grade)
                </small>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  {editingYearLevel ? 'Update' : 'Create'} Year Level
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {yearLevels.length === 0 ? (
        <div className="no-data">
          <p>No year levels found. Create your first year level to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Level Name</th>
                <th>Grade Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {yearLevels
                .sort((a, b) => a.level_order - b.level_order)
                .map((yearLevel) => {
                  const gradeNames = ['', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade'];
                  const gradeName = gradeNames[yearLevel.level_order] || `${yearLevel.level_order}th Grade`;
                  
                  return (
                    <tr key={yearLevel._id}>
                      <td>{yearLevel.level_name}</td>
                      <td>{gradeName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <button
                            onClick={() => handleEdit(yearLevel)}
                            className="btn btn--primary btn--sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(yearLevel._id)}
                            className="btn btn--danger btn--sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
