import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGuardianWizard } from './admin/SimpleGuardianWizard';
import { StudentGuardianAssignment } from './admin/StudentGuardianAssignment';

export function GuardianDashboard() {
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
            alt="Santa Isabel Escola" 
            loading="eager" 
          />
          <div className="portal-header__title">
            <h1>Guardian Portal</h1>
            <span className="portal-header__subtitle">Santa Isabel Escola</span>
          </div>
        </div>
        <div className="portal-header__actions">
          <button className="btn btn--secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn--small" onClick={() => navigate('/landing')}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2>Guardian Management</h2>
          <p className="hero__subtitle">Manage guardians and their relationships with students.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button 
            className="btn btn--secondary"
            onClick={() => setShowAssignGuardian(true)}
          >
            Assign Guardian to Student
          </button>
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateGuardian(true)}
          >
            Create New Guardian
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Guardian Management</h3>
          <p>Create and manage guardian information including contact details and relationships.</p>
        </div>

        <div className="feature-card">
          <h3>Student Relationships</h3>
          <p>Link guardians with students and manage their relationships and permissions.</p>
        </div>

        <div className="feature-card">
          <h3>Guardian Types</h3>
          <p>Guardian types are automatically managed during the assignment workflow.</p>
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
