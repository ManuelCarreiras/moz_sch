import React from 'react';
import { useTranslation } from 'react-i18next';

interface AssignmentWizardSimpleProps {
  onClose: () => void;
}

const AssignmentWizardSimple: React.FC<AssignmentWizardSimpleProps> = ({ onClose }) => {
  const { t } = useTranslation();
  console.log('AssignmentWizardSimple rendering');

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1e2936',
          color: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%'
        }}
      >
        <h3>Test Modal</h3>
        <p>If you see this, the modal rendering works!</p>
        <button onClick={onClose} style={{ marginTop: '1rem' }}>{t('common.close')}</button>
      </div>
    </div>
  );
};

export default AssignmentWizardSimple;

