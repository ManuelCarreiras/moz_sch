import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface GuardianType {
  _id: string;
  name: string;
}

export function GuardianTypesTable() {
  const [guardianTypes, setGuardianTypes] = useState<GuardianType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGuardianType, setNewGuardianType] = useState({ name: '' });

  useEffect(() => {
    fetchGuardianTypes();
  }, []);

  const fetchGuardianTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGuardianTypes();
      
      if (response.success) {
        const guardianTypeData = (response.data as any).message || response.data;
        setGuardianTypes(Array.isArray(guardianTypeData) ? guardianTypeData : []);
      } else {
        setError(response.error || 'Failed to fetch guardian types');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching guardian types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuardianType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGuardianType.name.trim()) {
      return;
    }

    try {
      const response = await apiService.createGuardianType(newGuardianType);
      
      if (response.success) {
        alert('Guardian type created successfully!');
        setNewGuardianType({ name: '' });
        setShowCreateForm(false);
        fetchGuardianTypes();
      } else {
        setError(response.error || 'Failed to create guardian type');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating guardian type:', err);
    }
  };

  const handleDeleteGuardianType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guardian type?')) {
      return;
    }

    try {
      const response = await apiService.deleteGuardianType(id);
      
      if (response.success) {
        alert('Guardian type deleted successfully!');
        fetchGuardianTypes();
      } else {
        setError(response.error || 'Failed to delete guardian type');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting guardian type:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading guardian types...</div>;
  }

  return (
    <div className="guardian-types-table">
      <div className="table-header">
        <h3>Guardian Types</h3>
        <p className="table-description">Guardian types are managed during guardian creation workflow.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setShowCreateForm(false)}>
          <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Add Guardian Type</h2>
              <button className="icon-btn" aria-label="Close" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <div className="modal__content">
              <form onSubmit={handleCreateGuardianType} className="guardian-type-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Guardian Type Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={newGuardianType.name}
                      onChange={(e) => setNewGuardianType({ name: e.target.value })}
                      required
                      placeholder="e.g., Parent, Grandparent, Legal Guardian"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newGuardianType.name.trim()}
                    className="btn btn--primary"
                  >
                    Create Guardian Type
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guardianTypes.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-data">
                  No guardian types found. Create one to get started.
                </td>
              </tr>
            ) : (
              guardianTypes.map((guardianType) => (
                <tr key={guardianType._id}>
                  <td>{guardianType._id.substring(0, 8)}...</td>
                  <td>{guardianType.name}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteGuardianType(guardianType._id)}
                      className="btn btn--danger btn--small"
                      title="Delete guardian type"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
