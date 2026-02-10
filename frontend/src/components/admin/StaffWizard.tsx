import React, { useState } from 'react';
import { apiService } from '../../services/apiService';

interface StaffWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface StaffFormData {
  given_name: string;
  surname: string;
  gender: string;
  email_address: string;
  phone_number: string;
  role: string;
  hire_date: string;
  base_salary: string;
}

export function StaffWizard({ onClose, onSuccess }: StaffWizardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    given_name: '',
    surname: '',
    gender: 'Male',
    email_address: '',
    phone_number: '',
    role: 'financial',
    hire_date: '',
    base_salary: ''
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
      // Prepare data for API
      const submitData: any = {
        given_name: formData.given_name,
        surname: formData.surname,
        gender: formData.gender,
        email_address: formData.email_address,
        phone_number: formData.phone_number,
        role: formData.role
      };

      // Add optional fields if provided
      if (formData.hire_date) {
        submitData.hire_date = formData.hire_date;
      }
      if (formData.base_salary && formData.base_salary.trim() !== '') {
        submitData.base_salary = parseFloat(formData.base_salary);
      }

      const response = await apiService.createStaff(submitData);
      
      if (response.success) {
        alert('Staff member created successfully!');
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Failed to create staff member');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Create New Staff Member</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          <form onSubmit={handleSubmit} className="staff-form">
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
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="financial">Financial</option>
                  <option value="secretary">Secretary</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  placeholder="Select hire date"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="base_salary">Base Salary (Monthly)</label>
                <input
                  type="number"
                  id="base_salary"
                  name="base_salary"
                  value={formData.base_salary}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Enter base monthly salary"
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
                disabled={loading || !formData.given_name || !formData.surname || !formData.email_address || !formData.phone_number}
                className="btn btn--primary"
              >
                {loading ? 'Creating...' : 'Create Staff Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
