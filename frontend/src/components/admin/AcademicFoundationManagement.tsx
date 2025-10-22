import React, { useState } from 'react';
import TermTable from './TermTable';
import PeriodTable from './PeriodTable';

type AcademicFoundationTab = 'terms' | 'periods';

const AcademicFoundationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AcademicFoundationTab>('terms');

  const tabs = [
    { id: 'terms' as const, label: 'Terms', description: 'Manage academic terms (semesters/quarters)' },
    { id: 'periods' as const, label: 'Periods', description: 'Manage daily class periods and schedules' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'terms':
        return <TermTable />;
      case 'periods':
        return <PeriodTable />;
      default:
        return <TermTable />;
    }
  };

  return (
    <div className="academic-foundation-management">
      <div className="management-header">
        <h1>Academic Foundation Management</h1>
        <p>Configure the fundamental academic structure including terms, periods, and grading systems.</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="tab-content">
                <h3>{tab.label}</h3>
                <p>{tab.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">
        {renderTabContent()}
      </div>

      {/* Setup Requirements */}
      <div className="setup-requirements">
        <h3>Setup Requirements</h3>
        <div className="requirements-grid">
          <div className="requirement-card">
            <h4>1. Terms</h4>
            <p>Create academic terms (semesters or quarters) for each school year. Terms define the academic periods within a school year.</p>
            <ul>
              <li>Term 1, Term 2, Term 3, Term 4</li>
              <li>Each term needs start and end dates</li>
              <li>Terms must fall within school year dates</li>
            </ul>
          </div>
          
          <div className="requirement-card">
            <h4>2. Periods</h4>
            <p>Define daily class periods and their schedules. Periods determine when classes are held throughout the day.</p>
            <ul>
              <li>1st Period: 08:00-09:00</li>
              <li>Morning Break: 09:00-09:15</li>
              <li>2nd Period: 09:15-10:15</li>
              <li>Lunch: 12:00-13:00</li>
            </ul>
          </div>
          
          <div className="requirement-card">
            <h4>3. Score Ranges (Now in Academic Setup)</h4>
            <p>Score ranges are now managed within the Subject management section in Academic Setup. Create grading scales when defining subjects.</p>
            <ul>
              <li>Go to Academic Setup → Subjects & Score Ranges</li>
              <li>Create score ranges (A: 90-100%, B: 80-89%, etc.)</li>
              <li>Assign score ranges to subjects during creation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicFoundationManagement;
