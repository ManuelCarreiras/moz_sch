import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';

interface TeacherWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface TeacherFormData {
  given_name: string;
  surname: string;
  gender: string;
  email_address: string;
  phone_number: string;
  year_start: string;
  academic_level: string;
  years_of_experience: string;
}


export function TeacherWizard({ onClose, onSuccess }: TeacherWizardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>({
    given_name: '',
    surname: '',
    gender: 'Male',
    email_address: '',
    phone_number: '',
    year_start: new Date().getFullYear().toString(),
    academic_level: 'Licentiate',
    years_of_experience: '0'
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
      const payload = {
        ...formData,
        year_start: parseInt(formData.year_start, 10),
        years_of_experience: parseInt(formData.years_of_experience, 10)
      };
      const response = await apiService.post('/teacher', payload);
      
      console.log('Teacher creation response:', response);
      if (response.success) {
        console.log('Teacher created successfully, showing alert');
        alert('Teacher created successfully!');
        onSuccess();
        onClose();
      } else {
        console.log('Teacher creation failed:', response.error);
        setError(response.error || 'Failed to create teacher');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating teacher:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Create New Teacher</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          <form onSubmit={handleSubmit} className="teacher-form">
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
            </div>

            <div className="form-row">
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
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email_address">Email Address *</label>
                <input
                  type="email"
                  id="email_address"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number *</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year_start">{t('admin.teacherWizard.yearStartLabel')}</label>
                <input
                  type="number"
                  id="year_start"
                  name="year_start"
                  value={formData.year_start}
                  onChange={handleInputChange}
                  required
                  min={1900}
                  max={2100}
                  placeholder="e.g. 2020"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="academic_level">{t('admin.teacherWizard.academicLevelLabel')}</label>
                <select
                  id="academic_level"
                  name="academic_level"
                  value={formData.academic_level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Bachelor">Bachelor</option>
                  <option value="Licentiate">Licentiate</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="years_of_experience">{t('admin.teacherWizard.yearsOfExperienceLabel')}</label>
                <input
                  type="number"
                  id="years_of_experience"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  required
                  min={0}
                  placeholder="e.g. 5"
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
                disabled={loading || !formData.given_name || !formData.surname || !formData.email_address || !formData.phone_number || !formData.year_start || !formData.academic_level || formData.years_of_experience === ''}
                className="btn btn--primary"
              >
                {loading ? 'Creating...' : 'Create Teacher'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}