// Admin Dashboard - mirrors your backend admin endpoints
// This follows the same pattern as your admin resources

import React, { useState, useEffect } from 'react';
import { Student, Teacher, SchoolYear } from '../../types';
import { studentService, teacherService, schoolYearService } from '../../services/api';
import { StudentCard } from '../../components/student/StudentCard';

export const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'academic'>('students');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd have endpoints to get all students, teachers, etc.
        // For now, we'll mock this data
        console.log('Fetching admin data...');
        
        // Mock data - replace with actual API calls
        setStudents([]);
        setTeachers([]);
        setSchoolYears([]);

      } catch (err) {
        setError('Failed to load admin data');
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
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
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System Administration Portal</p>
      </div>

      <div className="dashboard-content">
        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button 
            className={`tab ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            Teachers
          </button>
          <button 
            className={`tab ${activeTab === 'academic' ? 'active' : ''}`}
            onClick={() => setActiveTab('academic')}
          >
            Academic Structure
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Student Management</h2>
              <button className="btn btn-primary">Add New Student</button>
            </div>
            
            <div className="students-grid">
              {students.length > 0 ? (
                students.map((student) => (
                  <StudentCard 
                    key={student._id} 
                    student={student} 
                    showActions={true}
                    onEdit={(student) => console.log('Edit student:', student)}
                    onDelete={(id) => console.log('Delete student:', id)}
                  />
                ))
              ) : (
                <p>No students found. Add your first student to get started.</p>
              )}
            </div>
          </section>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Teacher Management</h2>
              <button className="btn btn-primary">Add New Teacher</button>
            </div>
            
            <div className="teachers-grid">
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <div key={teacher._id} className="teacher-card">
                    <h3>{teacher.given_name} {teacher.surname}</h3>
                    <p>Email: {teacher.email_address}</p>
                    <p>Phone: {teacher.phone_number}</p>
                    <div className="teacher-actions">
                      <button className="btn btn-primary">Edit</button>
                      <button className="btn btn-danger">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No teachers found. Add your first teacher to get started.</p>
              )}
            </div>
          </section>
        )}

        {/* Academic Structure Tab */}
        {activeTab === 'academic' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Academic Structure</h2>
              <button className="btn btn-primary">Add School Year</button>
            </div>
            
            <div className="academic-structure">
              <div className="structure-item">
                <h3>School Years</h3>
                <p>Manage academic years and terms</p>
                <button className="btn btn-secondary">Manage</button>
              </div>
              
              <div className="structure-item">
                <h3>Year Levels</h3>
                <p>Configure grade levels and progression</p>
                <button className="btn btn-secondary">Manage</button>
              </div>
              
              <div className="structure-item">
                <h3>Subjects & Departments</h3>
                <p>Organize academic subjects</p>
                <button className="btn btn-secondary">Manage</button>
              </div>
              
              <div className="structure-item">
                <h3>Classrooms</h3>
                <p>Manage physical facilities</p>
                <button className="btn btn-secondary">Manage</button>
              </div>
            </div>
          </section>
        )}

        {/* System Statistics */}
        <section className="dashboard-section">
          <h2>System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Students</h3>
              <p className="stat-number">{students.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Teachers</h3>
              <p className="stat-number">{teachers.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active School Years</h3>
              <p className="stat-number">{schoolYears.length}</p>
            </div>
            <div className="stat-card">
              <h3>System Status</h3>
              <p className="stat-status">Online</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
