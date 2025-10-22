import React, { useState, useEffect } from 'react';
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
        setError(response.error || 'Failed to fetch subjects');
      }
    } catch (err) {
      setError('Network error occurred');
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
        alert('Subject created successfully!');
        setNewSubjectName('');
        setSelectedDepartmentId('');
        setSelectedScoreRangeId('');
        fetchSubjects();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to create subject');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating subject:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const response = await apiService.deleteSubject(id);
      
      if (response.success) {
        alert('Subject deleted successfully!');
        fetchSubjects();
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Failed to delete subject');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting subject:', err);
    }
  };

  const handleCreateScoreRange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createScoreRange(newScoreRange);
      
      if (response.success) {
        alert('Score range created successfully!');
        setShowScoreRangeModal(false);
        setNewScoreRange({ grade: '', min_score: 0, max_score: 100 });
        fetchScoreRanges();
      } else {
        setError(response.error || 'Failed to create score range');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating score range:', err);
    }
  };


  if (loading) {
    return <div className="loading">Loading subjects...</div>;
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
              ← Back to Academic Setup
            </button>
          )}
          <div>
            <h3>Subjects & Score Ranges</h3>
            <p className="table-description">Define individual subjects and their grading scales. Create score ranges on-demand when creating subjects.</p>
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
        <h4>Add New Subject</h4>
        <form onSubmit={handleCreate} className="form-inline">
          <div className="form-group">
            <label htmlFor="subjectName">Subject Name *</label>
            <input
              type="text"
              id="subjectName"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              required
              placeholder="e.g., Algebra, Biology, Portuguese"
              disabled={isCreating}
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              required
              disabled={isCreating}
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.department_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="scoreRange">Score Range (Optional)</label>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <select
                id="scoreRange"
                value={selectedScoreRangeId}
                onChange={(e) => setSelectedScoreRangeId(e.target.value)}
                disabled={isCreating}
                style={{ flex: 1 }}
              >
                <option value="">No Score Range</option>
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
                + Create New
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isCreating || !newSubjectName.trim() || !selectedDepartmentId}
          >
            {isCreating ? 'Adding...' : 'Add Subject'}
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="table-container">
        <h4>Existing Subjects</h4>
        {subjects.length === 0 ? (
          <p className="no-data">No subjects found. Add one above!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Score Range</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.subject_name}</td>
                  <td>{subject.department_name || 'Unknown'}</td>
                  <td>
                    {subject.score_range ? (
                      <span className="grade-badge">
                        {subject.score_range.grade}: {subject.score_range.min_score}-{subject.score_range.max_score}%
                      </span>
                    ) : (
                      <span className="text-muted">No score range</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="btn btn--danger btn--small"
                    >
                      Delete
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
                  <h3>Create New Score Range</h3>
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
                    <label htmlFor="newGrade">Grade *</label>
                    <input
                      type="text"
                      id="newGrade"
                      value={newScoreRange.grade}
                      onChange={(e) => setNewScoreRange({ ...newScoreRange, grade: e.target.value.toUpperCase() })}
                      placeholder="e.g., A, B+, C, F"
                      maxLength={2}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newMinScore">Minimum Score *</label>
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
                    <label htmlFor="newMaxScore">Maximum Score *</label>
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
                      Create Score Range
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowScoreRangeModal(false);
                        setNewScoreRange({ grade: '', min_score: 0, max_score: 100 });
                      }}
                    >
                      Cancel
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
