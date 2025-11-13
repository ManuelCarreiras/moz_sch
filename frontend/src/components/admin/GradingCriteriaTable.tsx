import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface GradingCriteria {
  _id: string;
  subject_id: string;
  subject_name?: string;
  year_level_id: string;
  year_level_order?: number;
  school_year_id: string;
  school_year_name?: string;
  tests_weight: number;
  homework_weight: number;
  attendance_weight: number;
  total_weight: number;
  description?: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface YearLevel {
  _id: string;
  level_order: number;
}

interface SchoolYear {
  _id: string;
  year_name: string;
}

interface Props {
  onBack: () => void;
}

const GradingCriteriaTable: React.FC<Props> = ({ onBack }) => {
  const [criteria, setCriteria] = useState<GradingCriteria[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    year_level_id: '',
    school_year_id: '',
    tests_weight: '',
    homework_weight: '',
    attendance_weight: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [criteriaRes, subjectsRes, yearLevelsRes, schoolYearsRes] = await Promise.all([
        apiService.getGradingCriteria(),
        apiService.getSubjects(),
        apiService.getYearLevels(),
        apiService.getSchoolYears()
      ]);

      if (criteriaRes.success) {
        const data = (criteriaRes.data as any)?.grading_criteria || criteriaRes.data || [];
        setCriteria(Array.isArray(data) ? data : []);
      }

      if (subjectsRes.success) {
        const data = (subjectsRes.data as any)?.message || subjectsRes.data || [];
        setSubjects(Array.isArray(data) ? data : []);
      }

      if (yearLevelsRes.success) {
        const data = (yearLevelsRes.data as any)?.message || yearLevelsRes.data || [];
        const yearLevelsArray = Array.isArray(data) ? data : [];
        
        // Remove duplicates based on level_order
        const uniqueYearLevels = yearLevelsArray.filter((level, index, self) =>
          index === self.findIndex((l) => l.level_order === level.level_order)
        );
        
        // Sort by level_order
        uniqueYearLevels.sort((a, b) => a.level_order - b.level_order);
        
        setYearLevels(uniqueYearLevels);
      }

      if (schoolYearsRes.success) {
        const data = (schoolYearsRes.data as any)?.message || schoolYearsRes.data || [];
        setSchoolYears(Array.isArray(data) ? data : []);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const tests = parseFloat(formData.tests_weight) || 0;
    const homework = parseFloat(formData.homework_weight) || 0;
    const attendance = parseFloat(formData.attendance_weight) || 0;
    return tests + homework + attendance;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.year_level_id || !formData.school_year_id) {
      setError('Please select subject, year level, and school year');
      return;
    }

    const total = calculateTotal();
    if (Math.abs(total - 100) > 0.01) {
      setError(`Weights must add up to 100%. Current total: ${total}%`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        subject_id: formData.subject_id,
        year_level_id: formData.year_level_id,
        school_year_id: formData.school_year_id,
        tests_weight: parseFloat(formData.tests_weight),
        homework_weight: parseFloat(formData.homework_weight),
        attendance_weight: parseFloat(formData.attendance_weight),
        description: formData.description
      };

      let response;
      if (editingId) {
        response = await apiService.updateGradingCriteria(editingId, payload);
      } else {
        response = await apiService.createGradingCriteria(payload);
      }

      if (response.success) {
        setSuccess(editingId ? 'Criteria updated successfully!' : 'Criteria created successfully!');
        resetForm();
        loadData();
      } else {
        setError(response.error || response.message || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (criterion: GradingCriteria) => {
    setFormData({
      subject_id: criterion.subject_id,
      year_level_id: criterion.year_level_id,
      school_year_id: criterion.school_year_id,
      tests_weight: criterion.tests_weight.toString(),
      homework_weight: criterion.homework_weight.toString(),
      attendance_weight: criterion.attendance_weight.toString(),
      description: criterion.description || ''
    });
    setEditingId(criterion._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grading criteria?')) return;

    try {
      setLoading(true);
      const response = await apiService.deleteGradingCriteria(id);
      
      if (response.success) {
        setSuccess('Criteria deleted successfully!');
        loadData();
      } else {
        setError(response.error || 'Failed to delete');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: '',
      year_level_id: '',
      school_year_id: '',
      tests_weight: '',
      homework_weight: '',
      attendance_weight: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const total = calculateTotal();
  const isValid = Math.abs(total - 100) < 0.01;

  return (
    <div className="admin-content">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={onBack} className="btn btn--secondary" style={{ marginBottom: '1rem' }}>
          ← Back to Academic Setup
        </button>
        
        <h2>⚖️ Grading Criteria</h2>
        <p>Define the weight of Tests, Homework, and Attendance for each subject and year level. Weights must total 100%.</p>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          background: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          background: '#efe', 
          border: '1px solid #cfc',
          borderRadius: '4px',
          color: '#3c3'
        }}>
          {success}
        </div>
      )}

      {/* Add Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn--primary"
        >
          {showForm ? 'Cancel' : '+ Add Grading Criteria'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          background: 'var(--card)', 
          borderRadius: '8px',
          border: '2px solid var(--primary)'
        }}>
          <h3>{editingId ? 'Edit Grading Criteria' : 'Add New Grading Criteria'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  School Year *
                </label>
                <select
                  value={formData.school_year_id}
                  onChange={(e) => setFormData({ ...formData, school_year_id: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select School Year</option>
                  {schoolYears.map(sy => (
                    <option key={sy._id} value={sy._id}>{sy.year_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Subject *
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Year Level *
                </label>
                <select
                  value={formData.year_level_id}
                  onChange={(e) => setFormData({ ...formData, year_level_id: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select Year Level</option>
                  {yearLevels.map(y => (
                    <option key={y._id} value={y._id}>{y.level_order}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              background: 'var(--card)',
              border: `2px solid ${isValid ? 'var(--success)' : 'var(--warning)'}`,
              borderRadius: '8px'
            }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Component Weights (must total 100%)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    📝 Tests Weight (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.tests_weight}
                    onChange={(e) => setFormData({ ...formData, tests_weight: e.target.value })}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    📚 Homework Weight (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.homework_weight}
                    onChange={(e) => setFormData({ ...formData, homework_weight: e.target.value })}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    ✅ Attendance Weight (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.attendance_weight}
                    onChange={(e) => setFormData({ ...formData, attendance_weight: e.target.value })}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
              </div>

              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: isValid ? 'rgba(72, 187, 120, 0.1)' : 'rgba(237, 137, 54, 0.1)',
                border: `1px solid ${isValid ? 'var(--success)' : 'var(--warning)'}`,
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: isValid ? 'var(--success)' : 'var(--warning)'
              }}>
                Total: {total.toFixed(2)}% {isValid ? '✅' : '❌'}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
                style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn--primary" disabled={loading || !isValid}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn--secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>School Year</th>
              <th>Subject</th>
              <th>Year Level</th>
              <th style={{ textAlign: 'right' }}>📝 Tests (%)</th>
              <th style={{ textAlign: 'right' }}>📚 Homework (%)</th>
              <th style={{ textAlign: 'right' }}>✅ Attendance (%)</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && criteria.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  No grading criteria found. Add your first one!
                </td>
              </tr>
            )}
            {!loading && criteria.map((criterion) => (
              <tr key={criterion._id}>
                <td>{criterion.school_year_name || criterion.school_year_id}</td>
                <td><strong>{criterion.subject_name || criterion.subject_id}</strong></td>
                <td>{criterion.year_level_order || criterion.year_level_id}</td>
                <td style={{ textAlign: 'right' }}>{criterion.tests_weight}%</td>
                <td style={{ textAlign: 'right' }}>{criterion.homework_weight}%</td>
                <td style={{ textAlign: 'right' }}>{criterion.attendance_weight}%</td>
                <td style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold',
                  color: criterion.total_weight === 100 ? '#3c3' : '#c33'
                }}>
                  {criterion.total_weight}% {criterion.total_weight === 100 ? '✅' : '❌'}
                </td>
                <td style={{ fontSize: '0.9em', color: 'var(--muted)' }}>
                  {criterion.description || '-'}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(criterion)}
                    className="btn btn--small"
                    style={{ marginRight: '0.5rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(criterion._id)}
                    className="btn btn--small btn--danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradingCriteriaTable;
