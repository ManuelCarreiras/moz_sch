import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';

export interface Subject {
  _id: string;
  department_id: string;
  subject_name: string;
  department_name?: string;
  score_range_id?: string;
  score_range?: {
    _id: string;
    min_score: number;
    max_score: number;
    grade: string;
  };
}

export interface Department {
  _id: string;
  department_name: string;
}

export interface ScoreRange {
  _id: string;
  min_score: number;
  max_score: number;
  grade: string;
}

interface SubjectTableProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function SubjectTable({ onSuccess, onBack }: SubjectTableProps) {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [scoreRanges, setScoreRanges] = useState<ScoreRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedScoreRangeId, setSelectedScoreRangeId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showScoreRangeModal, setShowScoreRangeModal] = useState(false);
  const [newScoreRange, setNewScoreRange] = useState({
    grade: '',
    min_score: 0,
    max_score: 100
  });

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
    fetchScoreRanges();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubjects();
      
      if (response.success) {
        const subjectData = (response.data as any).message || response.data;
        setSubjects(Array.isArray(subjectData) ? subjectData : []);
        setError(null);
      } else {
        setError(response.error || t('admin.subjects.failedFetch'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success) {
        const departmentData = (response.data as any).message || response.data;
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchScoreRanges = async () => {
    try {
      const response = await apiService.getScoreRanges();
      if (response.success) {
        const scoreRangeData = (response.data as any).message || response.data;
        setScoreRanges(Array.isArray(scoreRangeData) ? scoreRangeData : []);
      }
    } catch (err) {
      console.error('Error fetching score ranges:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedDepartmentId) return;

    setIsCreating(true);
    setError(null);

    try {
      const subjectData: any = {
        subject_name: newSubjectName.trim(),
        department_id: selectedDepartmentId
      };

      if (selectedScoreRangeId) {
        subjectData.score_range_id = selectedScoreRangeId;
      }

      const response = await apiService.createSubject(subjectData);

      if (response.success) {
        alert(t('admin.subjects.createSuccess'));
        setNewSubjectName('');
        setSelectedDepartmentId('');
        setSelectedScoreRangeId('');
        fetchSubjects();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.subjects.failedCreate'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error creating subject:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.subjects.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteSubject(id);
      
      if (response.success) {
        alert(t('admin.subjects.deleteSuccess'));
        fetchSubjects();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || t('admin.subjects.failedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error deleting subject:', err);
    }
  };

  const handleCreateScoreRange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createScoreRange(newScoreRange);
      
      if (response.success) {
        alert(t('admin.subjects.scoreRangeSuccess'));
        setShowScoreRangeModal(false);
        setNewScoreRange({ grade: '', min_score: 0, max_score: 100 });
        fetchScoreRanges();
      } else {
        setError(response.error || t('admin.subjects.scoreRangeFailed'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error creating score range:', err);
    }
  };


  if (loading) {
    return <div className="loading">{t('admin.subjects.loadingSubjects')}</div>;
  }

  return (
    <div className="subject-table">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {onBack && (
            <button 
              className="btn btn--secondary"
              onClick={onBack}
            >
              {t('admin.subjects.backToSetup')}
            </button>
          )}
          <div>
            <h3>{t('admin.subjects.title')}</h3>
            <p className="table-description">{t('admin.subjects.subtitle')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* Create Subject Form */}
      <div className="form-section">
        <h4>{t('admin.subjects.addNew')}</h4>
        <form onSubmit={handleCreate} className="form-inline">
          <div className="form-group">
            <label htmlFor="subjectName">{t('admin.subjects.nameLabel')}</label>
            <input
              type="text"
              id="subjectName"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              required
              placeholder={t('admin.subjects.namePlaceholder')}
              disabled={isCreating}
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">{t('admin.subjects.departmentLabel')}</label>
            <select
              id="department"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              required
              disabled={isCreating}
            >
              <option value="">{t('admin.subjects.selectDepartment')}</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.department_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="scoreRange">{t('admin.subjects.scoreRangeLabel')}</label>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <select
                id="scoreRange"
                value={selectedScoreRangeId}
                onChange={(e) => setSelectedScoreRangeId(e.target.value)}
                disabled={isCreating}
                style={{ flex: 1 }}
              >
                <option value="">{t('admin.subjects.noScoreRange')}</option>
                {scoreRanges.map((scoreRange) => (
                  <option key={scoreRange._id} value={scoreRange._id}>
                    {scoreRange.grade}: {scoreRange.min_score}-{scoreRange.max_score}%
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowScoreRangeModal(true)}
                disabled={isCreating}
              >
                {t('admin.subjects.createNew')}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isCreating || !newSubjectName.trim() || !selectedDepartmentId}
          >
            {isCreating ? t('common.adding') : t('admin.subjects.addSubject')}
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="table-container">
        <h4>{t('admin.subjects.existing')}</h4>
        {subjects.length === 0 ? (
          <p className="no-data">{t('admin.subjects.noSubjects')}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.subjects.subjectName')}</th>
                <th>{t('common.department')}</th>
                <th>{t('admin.subjects.scoreRange')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.subject_name}</td>
                  <td>{subject.department_name || t('common.unknown')}</td>
                  <td>
                    {subject.score_range ? (
                      <span className="grade-badge">
                        {subject.score_range.grade}: {subject.score_range.min_score}-{subject.score_range.max_score}%
                      </span>
                    ) : (
                      <span className="text-muted">{t('admin.subjects.noScoreRangeAssigned')}</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(subject._id)}
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

      {/* Score Range Creation Modal */}
      {showScoreRangeModal && (
        <div className="modal">
          <div className="modal__overlay">
            <div className="modal__dialog">
              <div className="modal__content">
                <div className="modal__header">
                  <h3>{t('admin.subjects.createScoreRange')}</h3>
                  <button 
                    className="modal__close"
                    onClick={() => {
                      setShowScoreRangeModal(false);
                      setNewScoreRange({ grade: '', min_score: 0, max_score: 100 });
                    }}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleCreateScoreRange} className="student-form">
                  <div className="form-group">
                    <label htmlFor="newGrade">{t('admin.subjects.gradeLabel')}</label>
                    <input
                      type="text"
                      id="newGrade"
                      value={newScoreRange.grade}
                      onChange={(e) => setNewScoreRange({ ...newScoreRange, grade: e.target.value.toUpperCase() })}
                      placeholder={t('admin.subjects.gradePlaceholder')}
                      maxLength={2}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newMinScore">{t('admin.subjects.minScoreLabel')}</label>
                    <input
                      type="number"
                      id="newMinScore"
                      value={newScoreRange.min_score}
                      onChange={(e) => setNewScoreRange({ ...newScoreRange, min_score: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newMaxScore">{t('admin.subjects.maxScoreLabel')}</label>
                    <input
                      type="number"
                      id="newMaxScore"
                      value={newScoreRange.max_score}
                      onChange={(e) => setNewScoreRange({ ...newScoreRange, max_score: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {t('admin.subjects.createScoreRangeBtn')}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowScoreRangeModal(false);
                        setNewScoreRange({ grade: '', min_score: 0, max_score: 100 });
                      }}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
