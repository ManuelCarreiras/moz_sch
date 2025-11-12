import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface GradingCriteria {
  _id: string;
  subject_id: string;
  subject_name?: string;
  year_level_id: string;
  year_level_name?: string;
  component_name: string;
  weight: number;
  source_type: string;
  assessment_type_id?: string;
  assessment_type_name?: string;
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

interface AssessmentType {
  _id: string;
  type_name: string;
}

interface Props {
  onBack: () => void;
}

const GradingCriteriaTable: React.FC<Props> = ({ onBack }) => {
  const [criteria, setCriteria] = useState<GradingCriteria[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterYearLevelId, setFilterYearLevelId] = useState('');
  
  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    year_level_id: '',
    component_name: '',
    weight: '',
    source_type: 'assignment',
    assessment_type_id: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [filterSubjectId, filterYearLevelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [criteriaRes, subjectsRes, yearLevelsRes, assessmentTypesRes] = await Promise.all([
        apiService.getGradingCriteria({
          subject_id: filterSubjectId || undefined,
          year_level_id: filterYearLevelId || undefined
        }),
        apiService.getSubjects(),
        apiService.getYearLevels(),
        apiService.getAssessmentTypes()
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

      if (assessmentTypesRes.success) {
        const data = (assessmentTypesRes.data as any)?.message || assessmentTypesRes.data || [];
        setAssessmentTypes(Array.isArray(data) ? data : []);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.year_level_id || !formData.component_name || !formData.weight) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.weight) < 0 || parseFloat(formData.weight) > 100) {
      setError('Weight must be between 0 and 100');
      return;
    }

    if (formData.source_type === 'assignment' && !formData.assessment_type_id) {
      setError('Assessment Type is required for assignment source');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        weight: parseFloat(formData.weight),
        assessment_type_id: formData.source_type === 'assignment' ? formData.assessment_type_id : undefined
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
        setError(response.error || 'Operation failed');
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
      component_name: criterion.component_name,
      weight: criterion.weight.toString(),
      source_type: criterion.source_type,
      assessment_type_id: criterion.assessment_type_id || '',
      description: criterion.description || ''
    });
    setEditingId(criterion._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this criterion?')) return;

    try {
      setLoading(true);
      const response = await apiService.deleteGradingCriteria(id);
      
      if (response.success) {
        setSuccess('Criterion deleted successfully!');
        loadData();
      } else {
        setError(response.error || 'Failed to delete criterion');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete criterion');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: '',
      year_level_id: '',
      component_name: '',
      weight: '',
      source_type: 'assignment',
      assessment_type_id: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Calculate total weight for filtered criteria
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="admin-content">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={onBack} className="btn btn--secondary" style={{ marginBottom: '1rem' }}>
          ← Back to Academic Setup
        </button>
        
        <h2>⚖️ Grading Criteria</h2>
        <p>Define how grades are calculated for each subject and year level. All students in the same year level will use the same criteria.</p>
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

      {/* Filters */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        background: 'var(--card)', 
        borderRadius: '8px',
        display: 'flex',
        gap: '1rem',
        alignItems: 'end'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Subject:
          </label>
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.subject_name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Year Level:
          </label>
          <select
            value={filterYearLevelId}
            onChange={(e) => setFilterYearLevelId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">All Year Levels</option>
            {yearLevels.map(y => (
              <option key={y._id} value={y._id}>{y.level_order}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn--primary"
        >
          {showForm ? 'Cancel' : '+ Add Criterion'}
        </button>
      </div>

      {/* Total Weight Display */}
      {filterSubjectId && filterYearLevelId && criteria.length > 0 && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: totalWeight === 100 ? '#efe' : '#ffe',
          border: `1px solid ${totalWeight === 100 ? '#cfc' : '#ffc'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <strong>Total Weight: {totalWeight}%</strong>
          {totalWeight === 100 && ' ✅ Complete'}
          {totalWeight < 100 && ` ⚠️ Incomplete (${100 - totalWeight}% remaining)`}
          {totalWeight > 100 && ` ❌ Over by ${totalWeight - 100}%`}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          background: 'var(--card)', 
          borderRadius: '8px',
          border: '2px solid var(--primary)'
        }}>
          <h3>{editingId ? 'Edit Criterion' : 'Add New Criterion'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Subject *
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  required
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
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select Year Level</option>
                  {yearLevels.map(y => (
                    <option key={y._id} value={y._id}>{y.level_order}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Component Name *
                </label>
                <input
                  type="text"
                  value={formData.component_name}
                  onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                  placeholder="e.g., Tests, Homework, Attendance"
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Weight (%) *
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                  Source Type *
                </label>
                <select
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value, assessment_type_id: '' })}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="assignment">Assignment</option>
                  <option value="attendance">Attendance</option>
                </select>
              </div>

              {formData.source_type === 'assignment' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Assessment Type *
                  </label>
                  <select
                    value={formData.assessment_type_id}
                    onChange={(e) => setFormData({ ...formData, assessment_type_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem' }}
                  >
                    <option value="">Select Type</option>
                    {assessmentTypes.map(a => (
                      <option key={a._id} value={a._id}>{a.type_name}</option>
                    ))}
                  </select>
                </div>
              )}
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
              <button type="submit" className="btn btn--primary" disabled={loading}>
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
              <th>Subject</th>
              <th>Year Level</th>
              <th>Component</th>
              <th>Weight (%)</th>
              <th>Source</th>
              <th>Assessment Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && criteria.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  No grading criteria found. {filterSubjectId || filterYearLevelId ? 'Try adjusting filters.' : 'Add your first criterion!'}
                </td>
              </tr>
            )}
            {!loading && criteria.map((criterion) => (
              <tr key={criterion._id}>
                <td>{criterion.subject_name || criterion.subject_id}</td>
                <td>{(criterion as any).year_level_order || criterion.year_level_id}</td>
                <td><strong>{criterion.component_name}</strong></td>
                <td style={{ textAlign: 'right' }}>{criterion.weight}%</td>
                <td>{criterion.source_type}</td>
                <td>{criterion.assessment_type_name || '-'}</td>
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

