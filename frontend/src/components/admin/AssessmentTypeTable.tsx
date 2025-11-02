import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface AssessmentType {
  _id: string;
  type_name: string;
  description: string;
  created_date?: string;
}

const AssessmentTypeTable: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<AssessmentType | null>(null);
  const [formData, setFormData] = useState({
    type_name: '',
    description: ''
  });

  useEffect(() => {
    fetchAssessmentTypes();
  }, []);

  const fetchAssessmentTypes = async () => {
    try {
      const response = await apiService.getAssessmentTypes();
      if (response.success && response.data) {
        const typesData = (response.data as any)?.assessment_types || response.data || [];
        setAssessmentTypes(typesData);
      }
    } catch (error) {
      console.error('Error fetching assessment types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingType) {
        response = await apiService.updateAssessmentType(editingType._id, formData);
      } else {
        response = await apiService.createAssessmentType(formData);
      }

      if (response.success) {
        alert(editingType ? 'Assessment type updated successfully!' : 'Assessment type created successfully!');
        setShowModal(false);
        setEditingType(null);
        setFormData({ type_name: '', description: '' });
        fetchAssessmentTypes();
      } else {
        alert('Error: ' + (response.message || response.error || 'Failed to save assessment type'));
      }
    } catch (error) {
      console.error('Error saving assessment type:', error);
      alert('Error saving assessment type');
    }
  };

  const handleEdit = (type: AssessmentType) => {
    setEditingType(type);
    setFormData({
      type_name: type.type_name,
      description: type.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, typeName: string) => {
    if (window.confirm(`Are you sure you want to delete "${typeName}"?`)) {
      try {
        const response = await apiService.deleteAssessmentType(id);
        if (response.success) {
          alert('Assessment type deleted successfully!');
          fetchAssessmentTypes();
        } else {
          alert('Error: ' + (response.message || response.error || 'Failed to delete assessment type'));
        }
      } catch (error) {
        console.error('Error deleting assessment type:', error);
        alert('Error deleting assessment type');
      }
    }
  };

  if (loading) {
    return <div>Loading assessment types...</div>;
  }

  return (
    <div className="assessment-type-management">
      <div className="management-header">
        <h2>Assessment Type Management</h2>
        <p>Manage types of assignments and evaluations (Homework, Quiz, Test, Project, etc.).</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Assessment Type
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Type Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessmentTypes.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                No assessment types found. Click "Add New Assessment Type" to create one.
              </td>
            </tr>
          ) : (
            assessmentTypes.map((type) => (
              <tr key={type._id}>
                <td><strong>{type.type_name}</strong></td>
                <td>{type.description || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(type)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(type._id, type.type_name)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingType ? 'Edit Assessment Type' : 'Add New Assessment Type'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setEditingType(null);
                  setFormData({ type_name: '', description: '' });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type Name *</label>
                <input
                  type="text"
                  value={formData.type_name}
                  onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                  placeholder="e.g., Homework, Quiz, Test, Project"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this assessment type (optional)"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingType(null);
                    setFormData({ type_name: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingType ? 'Update' : 'Create'} Assessment Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentTypeTable;

