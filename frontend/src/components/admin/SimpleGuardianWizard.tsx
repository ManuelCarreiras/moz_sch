import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';

interface SimpleGuardianWizardProps {
  onClose: () => void;
  onSuccess: (guardianId?: string) => void;
}

interface GuardianFormData {
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
}

export function SimpleGuardianWizard({ onClose, onSuccess }: SimpleGuardianWizardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuardianFormData>({
    given_name: '',
    surname: '',
    email_address: '',
    phone_number: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createGuardian(formData);
      
      console.log('Guardian creation response:', response); // Debug log
      if (response.success) {
        console.log('Guardian created successfully, showing alert'); // Debug log
        const guardianData = (response.data as any).message || response.data;
        const guardianId = guardianData._id || guardianData.id;
        alert(t('admin.simpleGuardianWizard.createSuccess'));
        onSuccess(guardianId);
        onClose();
      } else {
        console.log('Guardian creation failed:', response.error); // Debug log
        setError(response.error || t('admin.simpleGuardianWizard.failedCreate'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error creating guardian:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{t('admin.simpleGuardianWizard.title')}</h2>
          <button className="icon-btn" aria-label={t('common.close')} onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          <form onSubmit={handleSubmit} className="guardian-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="given_name">{t('common.givenName')} *</label>
                <input
                  type="text"
                  id="given_name"
                  name="given_name"
                  value={formData.given_name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('common.enterGivenName')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="surname">{t('common.surname')} *</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                  placeholder={t('common.enterSurname')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email_address">{t('common.email')} *</label>
                <input
                  type="email"
                  id="email_address"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleInputChange}
                  required
                  placeholder={t('common.enterEmail')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone_number">{t('common.phone')} *</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  placeholder={t('common.enterPhone')}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn--secondary"
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || !formData.given_name || !formData.surname || !formData.email_address || !formData.phone_number}
                className="btn btn--primary"
              >
                {loading ? t('common.creating') : t('admin.simpleGuardianWizard.createGuardian')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
