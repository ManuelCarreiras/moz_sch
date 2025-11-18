import React, { useState } from 'react';
import { apiService } from '../../services/apiService';

interface StudentWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface StudentFormData {
  given_name: string;
  middle_name: string;
  surname: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  enrollment_date: string;
  email: string;
}

export function StudentWizard({ onClose, onSuccess }: StudentWizardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    given_name: '',
    middle_name: '',
    surname: '',
    date_of_birth: '',
    gender: 'Male',
    enrollment_date: new Date().toISOString().split('T')[0], // Today's date
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post('/student', formData);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Failed to create student');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating student:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Add New Student</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="given_name">Given Name *</label>
                <input
                  type="text"
                  id="given_name"
                  name="given_name"
                  value={formData.given_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter given name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="middle_name">Middle Name</label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  placeholder="Enter middle name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="surname">Surname *</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter surname"
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth *</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="enrollment_date">Enrollment Date *</label>
                <input
                  type="date"
                  id="enrollment_date"
                  name="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn--secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.given_name || !formData.surname || !formData.email}
                className="btn btn--primary"
              >
                {loading ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}