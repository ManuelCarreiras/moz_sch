import React, { useState, useEffect } from 'react';
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
  const [periods, setPeriods] = useState<Period[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
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
        alert(editingPeriod ? 'Period updated successfully!' : 'Period created successfully!');
        setShowModal(false);
        setEditingPeriod(null);
        setFormData({ year_id: '', name: '', start_time: '', end_time: '' });
        fetchPeriods();
      } else {
        alert('Error: ' + (response.error || 'Failed to save period'));
      }
    } catch (error) {
      console.error('Error saving period:', error);
      alert('Error saving period');
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
    if (window.confirm('Are you sure you want to delete this period?')) {
      try {
        const response = await apiService.deletePeriod(id);
        if (response.success) {
          alert('Period deleted successfully!');
          fetchPeriods();
        } else {
          alert('Error: ' + (response.error || 'Failed to delete period'));
        }
      } catch (error) {
        console.error('Error deleting period:', error);
        alert('Error deleting period');
      }
    }
  };

  const getSchoolYearName = (yearId: string) => {
    const year = schoolYears.find(y => y._id === yearId);
    return year ? year.year_name : 'Unknown Year';
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (loading) {
    return <div>Loading periods...</div>;
  }

  return (
    <div className="period-management">
      <div className="management-header">
        <h2>Period Management</h2>
        <p>Manage class periods for school years. Periods define the daily schedule for classes (e.g., 1st Period: 08:00-09:00).</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Period
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Period Name</th>
              <th>School Year</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {periods.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No periods found</td>
              </tr>
            ) : (
              periods.map((period) => (
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
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(period._id)}
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

      {showModal && (
        <div className="modal">
          <div className="modal__dialog">
            <div className="modal__content">
              <div className="modal__header">
                <h3>{editingPeriod ? 'Edit Period' : 'Add New Period'}</h3>
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
                  <label htmlFor="year_id">School Year *</label>
                  <select
                    id="year_id"
                    value={formData.year_id}
                    onChange={(e) => setFormData({ ...formData, year_id: e.target.value })}
                    required
                  >
                    <option value="">Select School Year</option>
                    {schoolYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Period Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 1st Period, Morning Break, Lunch"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_time">Start Time *</label>
                  <input
                    type="time"
                    id="start_time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_time">End Time *</label>
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
                    {editingPeriod ? 'Update Period' : 'Create Period'}
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
                    Cancel
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
