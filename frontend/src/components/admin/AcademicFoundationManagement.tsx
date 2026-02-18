import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TermTable from './TermTable';
import PeriodTable from './PeriodTable';

type AcademicFoundationTab = 'terms' | 'periods';

const AcademicFoundationManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AcademicFoundationTab>('terms');

  const tabs = [
    { id: 'terms' as const, labelKey: 'admin.academicFoundation.termsTab', descriptionKey: 'admin.academicFoundation.termsDesc' },
    { id: 'periods' as const, labelKey: 'admin.academicFoundation.periodsTab', descriptionKey: 'admin.academicFoundation.periodsDesc' }
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
        <h1>{t('admin.academicFoundation.title')}</h1>
        <p>{t('admin.academicFoundation.subtitle')}</p>
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
                <h3>{t(tab.labelKey)}</h3>
                <p>{t(tab.descriptionKey)}</p>
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
        <h3>{t('admin.academicFoundation.setupRequirements')}</h3>
        <div className="requirements-grid">
          <div className="requirement-card">
            <h4>{t('admin.academicFoundation.termsRequirement')}</h4>
            <p>{t('admin.academicFoundation.termsRequirementDesc')}</p>
            <ul>
              <li>{t('admin.academicFoundation.termsExamples')}</li>
              <li>{t('admin.academicFoundation.termsNeedDates')}</li>
              <li>{t('admin.academicFoundation.termsWithinYear')}</li>
            </ul>
          </div>
          
          <div className="requirement-card">
            <h4>{t('admin.academicFoundation.periodsRequirement')}</h4>
            <p>{t('admin.academicFoundation.periodsRequirementDesc')}</p>
            <ul>
              <li>{t('admin.academicFoundation.periodExample1')}</li>
              <li>{t('admin.academicFoundation.periodExample2')}</li>
              <li>{t('admin.academicFoundation.periodExample3')}</li>
              <li>{t('admin.academicFoundation.periodExample4')}</li>
            </ul>
          </div>
          
          <div className="requirement-card">
            <h4>{t('admin.academicFoundation.scoreRangesNote')}</h4>
            <p>{t('admin.academicFoundation.scoreRangesDesc')}</p>
            <ul>
              <li>{t('admin.academicFoundation.goToSetup')}</li>
              <li>{t('admin.academicFoundation.createScoreRanges')}</li>
              <li>{t('admin.academicFoundation.assignScoreRanges')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicFoundationManagement;
