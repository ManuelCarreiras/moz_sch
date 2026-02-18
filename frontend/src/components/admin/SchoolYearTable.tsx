import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';

interface SchoolYearTableProps {
  onBack: () => void;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

export function SchoolYearTable({ onBack }: SchoolYearTableProps) {
  const { t } = useTranslation();
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSchoolYear, setEditingSchoolYear] = useState<SchoolYear | null>(null);
  const [formData, setFormData] = useState({
    year_name: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadSchoolYears();
  }, []);

  const loadSchoolYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSchoolYears();
      
      if (response.success) {
        const schoolYearData = (response.data as any)?.message || response.data;
        setSchoolYears(Array.isArray(schoolYearData) ? schoolYearData : []);
      } else {
        setError(response.error || 'Failed to load school years');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading school years:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year_name || !formData.start_date || !formData.end_date) {
      setError('Please fill in all fields');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (startDate >= endDate) {
      setError('End date must be after start date');
      return;
    }

    try {
      const submitData = {
        year_name: formData.year_name,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      };

      if (editingSchoolYear) {
        await apiService.updateSchoolYear(editingSchoolYear._id, submitData);
        alert('School year updated successfully!');
      } else {
        await apiService.createSchoolYear(submitData);
        alert('School year created successfully!');
      }

      setShowForm(false);
      setEditingSchoolYear(null);
      setFormData({ year_name: '', start_date: '', end_date: '' });
      loadSchoolYears();
    } catch (err) {
      console.error('Error saving school year:', err);
      alert('Failed to save school year');
    }
  };

  const handleEdit = (schoolYear: SchoolYear) => {
    setEditingSchoolYear(schoolYear);
    setFormData({
      year_name: schoolYear.year_name,
      start_date: schoolYear.start_date.split('T')[0], // Extract date part only
      end_date: schoolYear.end_date.split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school year?')) {
      return;
    }

    try {
      await apiService.deleteSchoolYear(id);
      alert('School year deleted successfully!');
      loadSchoolYears();
    } catch (err) {
      console.error('Error deleting school year:', err);
      alert('Failed to delete school year');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchoolYear(null);
    setFormData({ year_name: '', start_date: '', end_date: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          Loading school years...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button onClick={onBack} className="btn btn--secondary">
          {t('admin.schoolYears.backToManagement')}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2>{t('admin.schoolYears.title')}</h2>
          <p className="table-description">
            {t('admin.schoolYears.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn--primary"
        >
          {t('admin.schoolYears.addNew')}
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
              <h2>{editingSchoolYear ? t('admin.schoolYears.editTitle') : t('admin.schoolYears.addTitle')}</h2>
              <button onClick={handleCancel} className="icon-btn" aria-label="Close">✕</button>
            </div>

            <div className="modal__content">
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                  <label htmlFor="year_name">{t('admin.schoolYears.yearNameLabel')}</label>
                  <input
                    type="text"
                    id="year_name"
                    name="year_name"
                    value={formData.year_name}
                    onChange={handleInputChange}
                    required
                    placeholder={t('admin.schoolYears.yearNamePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_date">{t('admin.schoolYears.startDateLabel')}</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                  <small style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    {t('admin.schoolYears.startDateHint')}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">{t('admin.schoolYears.endDateLabel')}</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                  <small style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    {t('admin.schoolYears.endDateHint')}
                  </small>
                </div>

              <div className="form-actions" style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn--secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  {editingSchoolYear ? t('admin.schoolYears.updateSchoolYear') : t('admin.schoolYears.createSchoolYear')}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {schoolYears.length === 0 ? (
        <div className="no-data">
          <p>{t('admin.schoolYears.noYears')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.schoolYears.yearName')}</th>
                <th>{t('common.startDate')}</th>
                <th>{t('common.endDate')}</th>
                <th>{t('admin.schoolYears.duration')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {schoolYears
                .sort((a, b) => b.year_name.localeCompare(a.year_name)) // Sort by year name descending
                .map((schoolYear) => {
                  const startDate = new Date(schoolYear.start_date);
                  const endDate = new Date(schoolYear.end_date);
                  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)); // Approximate months
                  
                  return (
                    <tr key={schoolYear._id}>
                      <td>{schoolYear.year_name}</td>
                      <td>{formatDate(schoolYear.start_date)}</td>
                      <td>{formatDate(schoolYear.end_date)}</td>
                      <td>{t('admin.schoolYears.durationMonths', { count: duration })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <button
                            onClick={() => handleEdit(schoolYear)}
                            className="btn btn--primary btn--sm"
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(schoolYear._id)}
                            className="btn btn--danger btn--sm"
                          >
                            {t('common.delete')}
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
