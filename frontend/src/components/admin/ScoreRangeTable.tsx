import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface ScoreRange {
  _id: string;
  min_score: number;
  max_score: number;
  grade: string;
}

const ScoreRangeTable: React.FC = () => {
  const [scoreRanges, setScoreRanges] = useState<ScoreRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScoreRange, setEditingScoreRange] = useState<ScoreRange | null>(null);
  const [formData, setFormData] = useState({
    min_score: 0,
    max_score: 100,
    grade: ''
  });

  useEffect(() => {
    fetchScoreRanges();
  }, []);

  const fetchScoreRanges = async () => {
    try {
      const response = await apiService.getScoreRanges();
      if (response.success) {
        const scoreRangesData = (response.data as any)?.message || response.data;
        setScoreRanges(scoreRangesData);
      }
    } catch (error) {
      console.error('Error fetching score ranges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        min_score: parseFloat(formData.min_score.toString()),
        max_score: parseFloat(formData.max_score.toString())
      };

      let response;
      if (editingScoreRange) {
        response = await apiService.updateScoreRange(editingScoreRange._id, data);
      } else {
        response = await apiService.createScoreRange(data);
      }

      if (response.success) {
        alert(editingScoreRange ? 'Score range updated successfully!' : 'Score range created successfully!');
        setShowModal(false);
        setEditingScoreRange(null);
        setFormData({ min_score: 0, max_score: 100, grade: '' });
        fetchScoreRanges();
      } else {
        alert('Error: ' + (response.error || 'Failed to save score range'));
      }
    } catch (error) {
      console.error('Error saving score range:', error);
      alert('Error saving score range');
    }
  };

  const handleEdit = (scoreRange: ScoreRange) => {
    setEditingScoreRange(scoreRange);
    setFormData({
      min_score: scoreRange.min_score,
      max_score: scoreRange.max_score,
      grade: scoreRange.grade
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this score range?')) {
      try {
        const response = await apiService.deleteScoreRange(id);
        if (response.success) {
          alert('Score range deleted successfully!');
          fetchScoreRanges();
        } else {
          alert('Error: ' + (response.error || 'Failed to delete score range'));
        }
      } catch (error) {
        console.error('Error deleting score range:', error);
        alert('Error deleting score range');
      }
    }
  };

  if (loading) {
    return <div>Loading score ranges...</div>;
  }

  return (
    <div className="score-range-management">
      <div className="management-header">
        <h2>Score Range Management</h2>
        <p>Manage grading scales for the school. Define score ranges and their corresponding letter grades (e.g., 90-100 = A).</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add New Score Range
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Min Score</th>
              <th>Max Score</th>
              <th>Score Range</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scoreRanges.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No score ranges found</td>
              </tr>
            ) : (
              scoreRanges
                .sort((a, b) => b.max_score - a.max_score) // Sort by max score descending
                .map((scoreRange) => (
                <tr key={scoreRange._id}>
                  <td>
                    <span className="grade-badge">{scoreRange.grade}</span>
                  </td>
                  <td>{scoreRange.min_score}%</td>
                  <td>{scoreRange.max_score}%</td>
                  <td>{scoreRange.min_score}% - {scoreRange.max_score}%</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(scoreRange)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(scoreRange._id)}
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
                <h3>{editingScoreRange ? 'Edit Score Range' : 'Add New Score Range'}</h3>
                <button 
                  className="modal__close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingScoreRange(null);
                    setFormData({ min_score: 0, max_score: 100, grade: '' });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                  <label htmlFor="grade">Grade *</label>
                  <input
                    type="text"
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value.toUpperCase() })}
                    placeholder="e.g., A, B+, C, F"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_score">Minimum Score *</label>
                  <input
                    type="number"
                    id="min_score"
                    value={formData.min_score}
                    onChange={(e) => setFormData({ ...formData, min_score: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="max_score">Maximum Score *</label>
                  <input
                    type="number"
                    id="max_score"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingScoreRange ? 'Update Score Range' : 'Create Score Range'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingScoreRange(null);
                      setFormData({ min_score: 0, max_score: 100, grade: '' });
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

export default ScoreRangeTable;
