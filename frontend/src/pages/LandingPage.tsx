// Landing Page - Welcome screen and authentication gateway
// This is the entry point for all users

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Redirect to Cognito hosted UI
    // This will be implemented with AWS Cognito SDK
    console.log('Redirecting to Cognito login...');
    // For now, redirect to a mock login
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>Moz School Management System</h1>
        <p>Comprehensive school administration and academic tracking</p>
      </div>

      <div className="landing-content">
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎓 Student Portal</h3>
            <p>Access your academic progress, class schedules, and grades</p>
          </div>
          
          <div className="feature-card">
            <h3>👨‍🏫 Teacher Portal</h3>
            <p>Manage your classes, track student progress, and enter grades</p>
          </div>
          
          <div className="feature-card">
            <h3>🔧 Admin Portal</h3>
            <p>Complete system administration and user management</p>
          </div>
        </div>

        <div className="landing-actions">
          <button onClick={handleLogin} className="btn btn-primary btn-large">
            Login to Your Portal
          </button>
        </div>

        <div className="landing-info">
          <h4>System Features</h4>
          <ul>
            <li>Student enrollment and academic tracking</li>
            <li>Teacher class management and grade entry</li>
            <li>Administrative oversight and reporting</li>
            <li>Secure role-based access control</li>
            <li>Real-time data synchronization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
