// Student Card component - mirrors your backend StudentModel
// This follows the same pattern as your student model structure

import React from 'react';
import { Student } from '../../types';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  showActions?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="student-card">
      <div className="student-header">
        <h3>{student.given_name} {student.middle_name} {student.surname}</h3>
        <span className="student-id">ID: {student._id}</span>
      </div>
      
      <div className="student-details">
        <p><strong>Date of Birth:</strong> {formatDate(student.date_of_birth)}</p>
        <p><strong>Gender:</strong> {student.gender}</p>
        <p><strong>Enrollment Date:</strong> {formatDate(student.enrollment_date)}</p>
      </div>

      {showActions && (
        <div className="student-actions">
          {onEdit && (
            <button 
              onClick={() => onEdit(student)}
              className="btn btn-primary"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(student._id)}
              className="btn btn-danger"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};
