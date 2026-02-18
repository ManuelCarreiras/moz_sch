import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/apiService';

interface Period {
  _id: string;
  year_id: string;
  name: string;
  start_time: string;
  end_time: string;
  year_name?: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

const PeriodTable: React.FC = () => {
  const { t } = useTranslation();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    year_id: '',
    name: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchPeriods();
    fetchSchoolYears();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await apiService.getPeriods();
      if (response.success) {
        const periodsData = (response.data as any)?.message || response.data;
        setPeriods(periodsData);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolYears = async () => {
    try {
      const response = await apiService.getSchoolYears();
      if (response.success) {
        const yearsData = (response.data as any)?.message || response.data;
        setSchoolYears(yearsData);
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingPeriod) {
        response = await apiService.updatePeriod(editingPeriod._id, formData);
      } else {
        response = await apiService.createPeriod(formData);
      }

      if (response.success) {
        alert(editingPeriod ? t('admin.periods.updateSuccess') : t('admin.periods.createSuccess'));
        setShowModal(false);
        setEditingPeriod(null);
        setFormData({ year_id: '', name: '', start_time: '', end_time: '' });
        fetchPeriods();
      } else {
        alert('Error: ' + (response.error || t('admin.periods.failedSave')));
      }
    } catch (error) {
      console.error('Error saving period:', error);
      alert(t('admin.periods.failedSave'));
    }
  };

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setFormData({
      year_id: period.year_id,
      name: period.name,
      start_time: period.start_time.split('T')[1]?.substring(0, 5) || '',
      end_time: period.end_time.split('T')[1]?.substring(0, 5) || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.periods.confirmDelete'))) {
      try {
        const response = await apiService.deletePeriod(id);
        if (response.success) {
          alert(t('admin.periods.deleteSuccess'));
          fetchPeriods();
        } else {
          alert('Error: ' + (response.error || t('admin.periods.failedDelete')));
        }
      } catch (error) {
        console.error('Error deleting period:', error);
        alert(t('admin.periods.failedDelete'));
      }
    }
  };

  const getSchoolYearName = (yearId: string) => {
    const year = schoolYears.find(y => y._id === yearId);
    return year ? year.year_name : t('admin.periods.unknownYear');
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Filter periods by selected year
  const filteredPeriods = selectedYearFilter 
    ? periods.filter(p => p.year_id === selectedYearFilter)
    : periods;

  if (loading) {
    return <div>{t('admin.periods.loadingPeriods')}</div>;
  }

  return (
    <div className="period-management">
      <div className="management-header">
        <h2>{t('admin.periods.title')}</h2>
        <p>{t('admin.periods.subtitle')}</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          {t('admin.periods.addNew')}
        </button>
      </div>

      {/* Year Filter */}
      <div style={{ marginBottom: 'var(--space-md)', maxWidth: '400px' }}>
        <label htmlFor="year_filter" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-xs)',
          fontSize: '0.875rem',
          fontWeight: 500 
        }}>
          {t('admin.periods.filterByYear')}
        </label>
        <select
          id="year_filter"
          value={selectedYearFilter}
          onChange={(e) => setSelectedYearFilter(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--space-sm)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 'var(--text-base)',
            WebkitAppearance: 'menulist',
            MozAppearance: 'menulist',
            appearance: 'menulist'
          }}
        >
          <option value="">{t('common.selectAllYears')}</option>
          {schoolYears.map((year) => (
            <option 
              key={year._id} 
              value={year._id}
              style={{ background: 'var(--card)', color: 'var(--text)' }}
            >
              {year.year_name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('admin.periods.periodName')}</th>
              <th>{t('common.schoolYear')}</th>
              <th>{t('admin.periods.startTime')}</th>
              <th>{t('admin.periods.endTime')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeriods.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">{t('admin.periods.noPeriods')}</td>
              </tr>
            ) : (
              filteredPeriods.map((period) => (
                <tr key={period._id}>
                  <td>{period.name}</td>
                  <td>{getSchoolYearName(period.year_id)}</td>
                  <td>{formatTime(period.start_time)}</td>
                  <td>{formatTime(period.end_time)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(period)}
                    >
                      {t('common.edit')}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(period._id)}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal__dialog">
            <div className="modal__content">
              <div className="modal__header">
                <h3>{editingPeriod ? t('admin.periods.editTitle') : t('admin.periods.addTitle')}</h3>
                <button 
                  className="modal__close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPeriod(null);
                    setFormData({ year_id: '', name: '', start_time: '', end_time: '' });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                  <label htmlFor="year_id">{t('admin.periods.schoolYearLabel')}</label>
                  <select
                    id="year_id"
                    value={formData.year_id}
                    onChange={(e) => setFormData({ ...formData, year_id: e.target.value })}
                    required
                  >
                    <option value="">{t('admin.terms.selectSchoolYear')}</option>
                    {schoolYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name">{t('admin.periods.periodNameLabel')}</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('admin.periods.periodNamePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_time">{t('admin.periods.startTimeLabel')}</label>
                  <input
                    type="time"
                    id="start_time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_time">{t('admin.periods.endTimeLabel')}</label>
                  <input
                    type="time"
                    id="end_time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingPeriod ? t('admin.periods.updatePeriod') : t('admin.periods.createPeriod')}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPeriod(null);
                      setFormData({ year_id: '', name: '', start_time: '', end_time: '' });
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodTable;
