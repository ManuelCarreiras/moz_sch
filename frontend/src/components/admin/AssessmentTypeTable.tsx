import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/apiService';

interface AssessmentType {
  _id: string;
  type_name: string;
  description: string;
  created_date?: string;
}

const AssessmentTypeTable: React.FC = () => {
  const { t } = useTranslation();
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
    return <div>{t('admin.assessmentTypes.loadingTypes')}</div>;
  }

  return (
    <div className="assessment-type-management">
      <div className="management-header">
        <h2>{t('admin.assessmentTypes.title')}</h2>
        <p>{t('admin.assessmentTypes.subtitle')}</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          {t('admin.assessmentTypes.addNew')}
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>{t('admin.assessmentTypes.typeName')}</th>
            <th>{t('common.description')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {assessmentTypes.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                {t('admin.assessmentTypes.noTypes')}
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
                      {t('common.edit')}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(type._id, type.type_name)}
                    >
                      {t('common.delete')}
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
              <h3>{editingType ? t('admin.assessmentTypes.editTitle') : t('admin.assessmentTypes.addTitle')}</h3>
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
                <label>{t('admin.assessmentTypes.typeNameLabel')}</label>
                <input
                  type="text"
                  value={formData.type_name}
                  onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                  placeholder={t('admin.assessmentTypes.typeNamePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('admin.assessmentTypes.descriptionLabel')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('admin.assessmentTypes.descriptionPlaceholder')}
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
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingType ? t('admin.assessmentTypes.updateAssessmentType') : t('admin.assessmentTypes.createAssessmentType')}
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

