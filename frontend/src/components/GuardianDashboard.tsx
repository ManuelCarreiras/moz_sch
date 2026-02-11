import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SimpleGuardianWizard } from './admin/SimpleGuardianWizard';
import { StudentGuardianAssignment } from './admin/StudentGuardianAssignment';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';

export function GuardianDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCreateGuardian, setShowCreateGuardian] = useState(false);
  const [showAssignGuardian, setShowAssignGuardian] = useState(false);
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState<string | undefined>();

  const handleGuardianSuccess = (guardianId?: string) => {
    // Store the newly created guardian ID for pre-selection
    if (guardianId) {
      setNewlyCreatedGuardianId(guardianId);
    }
    console.log('Guardian created successfully');
  };

  const handleAssignmentSuccess = () => {
    // Refresh assignment data if needed
    setNewlyCreatedGuardianId(undefined); // Clear the pre-selected guardian
    console.log('Guardian assigned successfully');
  };

  return (
    <main className="hero">
      {/* Header with navigation */}
      <div className="portal-header">
        <div className="portal-header__brand">
          <img 
            className="portal-header__logo" 
            src="/src/assets/Santa_Isabel.png" 
            alt={t('common.schoolName')} 
            loading="eager" 
          />
          <div className="portal-header__title">
            <h1>{t('guardian.portalTitle')}</h1>
            <span className="portal-header__subtitle">{t('common.schoolName')}</span>
          </div>
        </div>
        <div className="portal-header__actions">
          <LanguageSelector />
          <ThemeSelector />
          <button className="btn btn--secondary" onClick={() => navigate('/dashboard')}>
            {t('common.backToDashboard')}
          </button>
          <button className="btn btn--small" onClick={() => navigate('/landing')}>
            {t('common.signOut')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2>{t('guardian.managementTitle')}</h2>
          <p className="hero__subtitle">{t('guardian.managementDesc')}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button 
            className="btn btn--secondary"
            onClick={() => setShowAssignGuardian(true)}
          >
            {t('guardian.assignGuardian')}
          </button>
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateGuardian(true)}
          >
            {t('guardian.createGuardian')}
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>{t('guardian.card1Title')}</h3>
          <p>{t('guardian.card1Desc')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('guardian.card2Title')}</h3>
          <p>{t('guardian.card2Desc')}</p>
        </div>

        <div className="feature-card">
          <h3>{t('guardian.card3Title')}</h3>
          <p>{t('guardian.card3Desc')}</p>
        </div>
      </div>

      {showCreateGuardian && (
        <SimpleGuardianWizard
          onClose={() => setShowCreateGuardian(false)}
          onSuccess={handleGuardianSuccess}
        />
      )}

      {showAssignGuardian && (
        <StudentGuardianAssignment
          onClose={() => setShowAssignGuardian(false)}
          onSuccess={handleAssignmentSuccess}
          preselectedGuardianId={newlyCreatedGuardianId}
        />
      )}
    </main>
  );
}
