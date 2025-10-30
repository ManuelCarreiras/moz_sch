import { useState } from 'react';
import { YearLevelTable } from './YearLevelTable';
import { SchoolYearTable } from './SchoolYearTable';

interface SchoolYearManagementProps {
  onBack: () => void;
}

type SchoolYearTab = 'year-levels' | 'school-years';

export function SchoolYearManagement({ onBack }: SchoolYearManagementProps) {
  const [activeTab, setActiveTab] = useState<SchoolYearTab>('year-levels');

  const tabs = [
    { id: 'year-levels' as SchoolYearTab, label: 'Year Levels', description: 'Manage grade levels with letters (A, B, C) and grades (1st-9th Grade)' },
    { id: 'school-years' as SchoolYearTab, label: 'School Years', description: 'Manage academic years (2026, 2027, etc.)' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'year-levels':
        return <YearLevelTable onBack={() => setActiveTab('year-levels')} />;
      case 'school-years':
        return <SchoolYearTable onBack={() => setActiveTab('school-years')} />;
      default:
        return <YearLevelTable onBack={() => setActiveTab('year-levels')} />;
    }
  };

  return (
    <div className="admin-content">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button onClick={onBack} className="btn btn--secondary">
          ← Back to Academic Setup
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>School Year Management</h2>
        <p className="table-description">
          Complete academic structure management. Set up year levels and school years.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-xs)', 
        marginBottom: 'var(--space-xl)',
        borderBottom: '2px solid var(--border-light)',
        paddingBottom: 'var(--space-md)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              border: 'none',
              borderRadius: 'var(--border-radius) var(--border-radius) 0 0',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s ease',
              position: 'relative',
              minWidth: '140px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <div style={{ 
        marginBottom: 'var(--space-lg)', 
        padding: 'var(--space-md)', 
        backgroundColor: 'var(--background-light)', 
        borderRadius: 'var(--border-radius)',
        borderLeft: '4px solid var(--primary)'
      }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          <strong>{tabs.find(t => t.id === activeTab)?.label}:</strong> {tabs.find(t => t.id === activeTab)?.description}
        </p>
      </div>


      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
