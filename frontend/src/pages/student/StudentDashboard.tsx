// Student Dashboard - mirrors your backend student-related endpoints
// This follows the same pattern as your student resources

import React, { useState, useEffect } from 'react';
import { Student, StudentYearLevel, StudentClass } from '../../types';
import { studentService, studentYearLevelService, studentClassService } from '../../services/api';
import { StudentCard } from '../../components/student/StudentCard';

export const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [yearLevelInfo, setYearLevelInfo] = useState<StudentYearLevel | null>(null);
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock student ID - in real app, this would come from authentication
  const studentId = 'mock-student-id';

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student information
        const studentResponse = await studentService.getStudent(studentId);
        if (studentResponse.success) {
          setStudent(studentResponse.message);
        }

        // Fetch year level information
        const yearLevelResponse = await studentYearLevelService.getStudentYearLevelInfo(studentId);
        if (yearLevelResponse.success) {
          setYearLevelInfo(yearLevelResponse.message);
        }

        // Fetch student classes
        const classesResponse = await studentClassService.getStudentClasses(studentId);
        if (classesResponse.success) {
          setStudentClasses(classesResponse.message);
        }

      } catch (err) {
        setError('Failed to load student data');
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back, {student?.given_name}!</p>
      </div>

      <div className="dashboard-content">
        {/* Student Information */}
        <section className="dashboard-section">
          <h2>Personal Information</h2>
          {student && (
            <StudentCard 
              student={student} 
              showActions={false}
            />
          )}
        </section>

        {/* Academic Information */}
        <section className="dashboard-section">
          <h2>Academic Information</h2>
          {yearLevelInfo && (
            <div className="academic-info">
              <p><strong>Current Year Level:</strong> {yearLevelInfo.year_level_id}</p>
              <p><strong>School Year:</strong> {yearLevelInfo.school_year_id}</p>
              <p><strong>Enrollment Date:</strong> {new Date(yearLevelInfo.enrollment_date).toLocaleDateString()}</p>
            </div>
          )}
        </section>

        {/* Class Schedule */}
        <section className="dashboard-section">
          <h2>My Classes</h2>
          {studentClasses.length > 0 ? (
            <div className="classes-list">
              {studentClasses.map((studentClass) => (
                <div key={studentClass._id} className="class-item">
                  <h4>Class: {studentClass.class_id}</h4>
                  <p>Enrolled: {new Date(studentClass.enrollment_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No classes enrolled yet.</p>
          )}
        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="btn btn-primary">View Grades</button>
            <button className="btn btn-secondary">Download Schedule</button>
            <button className="btn btn-secondary">Contact Teacher</button>
          </div>
        </section>
      </div>
    </div>
  );
};
