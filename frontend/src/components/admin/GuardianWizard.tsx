import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { StudentSelector, type Student } from './StudentSelector';

interface GuardianWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedStudentId?: string;
}

interface GuardianFormData {
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
}

interface GuardianType {
  _id: string;
  name: string;
}

type WizardStep = 'student' | 'guardian' | 'relationship';

export function GuardianWizard({ onClose, onSuccess, preselectedStudentId }: GuardianWizardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>('student');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [guardianTypes, setGuardianTypes] = useState<GuardianType[]>([]);
  const [selectedGuardianType, setSelectedGuardianType] = useState<string>('');
  const [formData, setFormData] = useState<GuardianFormData>({
    given_name: '',
    surname: '',
    email_address: '',
    phone_number: ''
  });

  useEffect(() => {
    if (preselectedStudentId) {
      // If student is pre-selected, skip to guardian step
      setCurrentStep('guardian');
    }
    fetchGuardianTypes();
  }, [preselectedStudentId]);

  const fetchGuardianTypes = async () => {
    try {
      const response = await apiService.getGuardianTypes();
      if (response.success) {
        const guardianTypeData = (response.data as any).message || response.data;
        setGuardianTypes(Array.isArray(guardianTypeData) ? guardianTypeData : []);
      }
    } catch (err) {
      console.error('Error fetching guardian types:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'guardian_type') {
      setSelectedGuardianType(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentStep('guardian');
  };

  const handleNext = () => {
    if (currentStep === 'guardian') {
      setCurrentStep('relationship');
    }
  };

  const handleBack = () => {
    if (currentStep === 'guardian') {
      setCurrentStep('student');
    } else if (currentStep === 'relationship') {
      setCurrentStep('guardian');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedGuardianType) {
      setError('Please select a student and guardian type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createGuardianWithStudent(
        formData,
        selectedStudent._id,
        selectedGuardianType
      );
      
      console.log('Guardian creation response:', response); // Debug log
      if (response.success) {
        console.log('Guardian created successfully, showing alert'); // Debug log
        alert(`Guardian created successfully and assigned to ${selectedStudent.given_name} ${selectedStudent.surname}!`); // Success alert
        onSuccess();
        onClose();
      } else {
        console.log('Guardian creation failed:', response.error); // Debug log
        setError(response.error || 'Failed to create guardian');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating guardian:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show student selector if we're on the student step
  if (currentStep === 'student') {
    return (
      <StudentSelector
        onSelect={handleStudentSelect}
        onClose={onClose}
        preselectedStudentId={preselectedStudentId}
      />
    );
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>
            {currentStep === 'guardian' ? 'Create New Guardian' : 'Confirm Relationship'}
            {selectedStudent && ` for ${selectedStudent.given_name} ${selectedStudent.surname}`}
          </h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          {/* Progress indicator */}
          <div className="wizard-progress">
            <div className="progress-step completed">
              <span>1</span>
              <label>Select Student</label>
            </div>
            <div className={`progress-step ${currentStep === 'guardian' ? 'active' : currentStep === 'relationship' ? 'completed' : ''}`}>
              <span>2</span>
              <label>Guardian Info</label>
            </div>
            <div className={`progress-step ${currentStep === 'relationship' ? 'active' : ''}`}>
              <span>3</span>
              <label>Relationship</label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="guardian-form">
            {currentStep === 'guardian' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="given_name">Given Name *</label>
                    <input
                      type="text"
                      id="given_name"
                      name="given_name"
                      value={formData.given_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter given name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="surname">Surname *</label>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter surname"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email_address">Email Address *</label>
                    <input
                      type="email"
                      id="email_address"
                      name="email_address"
                      value={formData.email_address}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 'relationship' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guardian_type">Relationship Type *</label>
                  <select
                    id="guardian_type"
                    name="guardian_type"
                    value={selectedGuardianType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select relationship type</option>
                    {guardianTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={currentStep === 'guardian' ? handleBack : onClose}
                className="btn btn--secondary"
                disabled={loading}
              >
                {currentStep === 'guardian' ? 'Back' : 'Cancel'}
              </button>
              
              {currentStep === 'guardian' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.given_name || !formData.surname || !formData.email_address || !formData.phone_number}
                  className="btn btn--primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !selectedGuardianType}
                  className="btn btn--primary"
                >
                  {loading ? 'Creating...' : 'Create Guardian & Assign'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
