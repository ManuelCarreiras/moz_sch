// Main App component - mirrors your backend webPlatform_api.py structure
// This follows the same pattern as your Flask app setup

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page - equivalent to your Home resource */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Student Routes */}
          <Route path="/student/*" element={<StudentDashboard />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/*" element={<div>Teacher Dashboard - Coming Soon</div>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
