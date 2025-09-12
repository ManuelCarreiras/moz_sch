// Student Form component - mirrors your backend StudentResource validation
// This follows the same pattern as your student resource validation

import React, { useState, useEffect } from 'react';
import { Student } from '../../types';

interface StudentFormProps {
  student?: Student;
  onSubmit: (studentData: Omit<Student, '_id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    given_name: '',
    middle_name: '',
    surname: '',
    date_of_birth: '',
    gender: '',
    enrollment_date: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        given_name: student.given_name,
        middle_name: student.middle_name || '',
        surname: student.surname,
        date_of_birth: student.date_of_birth.split('T')[0], // Convert to YYYY-MM-DD
        gender: student.gender,
        enrollment_date: student.enrollment_date.split('T')[0]
      });
    }
  }, [student]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Mirror your backend validation
    if (!formData.given_name) {
      newErrors.given_name = 'Given name is required';
    }
    if (!formData.middle_name) {
      newErrors.middle_name = 'Middle name is required';
    }
    if (!formData.surname) {
      newErrors.surname = 'Surname is required';
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.enrollment_date) {
      newErrors.enrollment_date = 'Enrollment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <div className="form-group">
        <label htmlFor="given_name">Given Name *</label>
        <input
          type="text"
          id="given_name"
          name="given_name"
          value={formData.given_name}
          onChange={handleChange}
          className={errors.given_name ? 'error' : ''}
        />
        {errors.given_name && <span className="error-message">{errors.given_name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="middle_name">Middle Name *</label>
        <input
          type="text"
          id="middle_name"
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
          className={errors.middle_name ? 'error' : ''}
        />
        {errors.middle_name && <span className="error-message">{errors.middle_name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="surname">Surname *</label>
        <input
          type="text"
          id="surname"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          className={errors.surname ? 'error' : ''}
        />
        {errors.surname && <span className="error-message">{errors.surname}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="date_of_birth">Date of Birth *</label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className={errors.date_of_birth ? 'error' : ''}
        />
        {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender *</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={errors.gender ? 'error' : ''}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && <span className="error-message">{errors.gender}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="enrollment_date">Enrollment Date *</label>
        <input
          type="date"
          id="enrollment_date"
          name="enrollment_date"
          value={formData.enrollment_date}
          onChange={handleChange}
          className={errors.enrollment_date ? 'error' : ''}
        />
        {errors.enrollment_date && <span className="error-message">{errors.enrollment_date}</span>}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : (student ? 'Update' : 'Create')} Student
        </button>
      </div>
    </form>
  );
};
