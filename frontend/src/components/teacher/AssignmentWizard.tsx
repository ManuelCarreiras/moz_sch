import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface AssignmentWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  editingAssignment?: Assignment | null;
}

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  subject_id: string;
  class_id: string;
  assessment_type_id: string;
  term_id: string;
  due_date?: string;
  max_score: number;
  weight: number;
  status: string;
}

interface AssessmentType {
  _id: string;
  type_name: string;
}

interface Class {
  _id: string;
  class_name: string;
  subject_id: string;
  subject_name?: string;
  term_id: string;
  term_number?: number;
}

const AssignmentWizard: React.FC<AssignmentWizardProps> = ({ onClose, onSuccess, editingAssignment }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    assessment_type_id: '',
    term_id: '',
    due_date: '',
    max_score: 100,
    weight: 10,
    status: 'draft'
  });

  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title,
        description: editingAssignment.description || '',
        class_id: editingAssignment.class_id,
        subject_id: editingAssignment.subject_id,
        assessment_type_id: editingAssignment.assessment_type_id,
        term_id: editingAssignment.term_id,
        due_date: editingAssignment.due_date ? editingAssignment.due_date.split('T')[0] : '',
        max_score: editingAssignment.max_score,
        weight: editingAssignment.weight,
        status: editingAssignment.status
      });
    }
  }, [editingAssignment]);

  const loadData = async () => {
    try {
      // Load assessment types
      const typesResponse = await apiService.getAssessmentTypes();
      if (typesResponse.success && typesResponse.data) {
        const types = (typesResponse.data as any)?.assessment_types || typesResponse.data || [];
        setAssessmentTypes(types);
      }

      // Load teacher's classes from schedule
      const scheduleResponse = await apiService.get('/teacher/schedule');
      if (scheduleResponse.success && scheduleResponse.data) {
        const classData = (scheduleResponse.data as any)?.classes || [];
        setClasses(classData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c._id === classId);
    if (selectedClass) {
      setFormData({
        ...formData,
        class_id: classId,
        subject_id: selectedClass.subject_id,
        term_id: selectedClass.term_id || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        max_score: Number(formData.max_score),
        weight: Number(formData.weight),
        due_date: formData.due_date || null
      };

      let response;
      if (editingAssignment) {
        response = await apiService.updateAssignment(editingAssignment._id, payload);
      } else {
        response = await apiService.createAssignment(payload);
      }

      if (response.success) {
        alert(editingAssignment ? 'Assignment updated successfully!' : 'Assignment created successfully!');
        onSuccess();
        onClose();
      } else {
        alert('Error: ' + (response.message || response.error || 'Failed to save assignment'));
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class *</label>
            <select
              value={formData.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              disabled={!!editingAssignment}
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.class_name} - {cls.subject_name}
                </option>
              ))}
            </select>
            <small>Only your classes are shown</small>
          </div>

          <div className="form-group">
            <label>Assignment Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Chapter 5 Quiz, Midterm Exam"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Assessment Type *</label>
            <select
              value={formData.assessment_type_id}
              onChange={(e) => setFormData({ ...formData, assessment_type_id: e.target.value })}
              required
            >
              <option value="">Select type</option>
              {assessmentTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Assignment instructions or details (optional)"
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Max Score *</label>
              <input
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                min="1"
                step="0.01"
                required
              />
              <small>Points possible</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Weight (%) *</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                min="0"
                max="100"
                step="0.01"
                required
              />
              <small>% of final grade</small>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
              <small>Students see published only</small>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentWizard;

