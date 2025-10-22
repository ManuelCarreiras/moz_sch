import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

interface Term {
  _id: string;
  year_id: string;
  term_number: number;
  start_date: string;
  end_date: string;
}

interface Period {
  _id: string;
  year_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface Department {
  _id: string;
  department_name: string;
}

type WizardStep = 'welcome' | 'academic-year' | 'terms' | 'periods' | 'departments' | 'completion';

const AcademicSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Academic Year
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [newYearName, setNewYearName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  
  // Step 2: Terms
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedYearForTerms, setSelectedYearForTerms] = useState<string>('');
  const [termCount, setTermCount] = useState(2); // Default to 2 terms (semesters)
  
  // Step 3: Periods
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedYearForPeriods, setSelectedYearForPeriods] = useState<string>('');
  const [periodsData] = useState([
    { name: '1st Period', start_time: '08:00', end_time: '09:00' },
    { name: '2nd Period', start_time: '09:15', end_time: '10:15' },
    { name: 'Break', start_time: '10:15', end_time: '10:30' },
    { name: '3rd Period', start_time: '10:30', end_time: '11:30' },
    { name: '4th Period', start_time: '11:45', end_time: '12:45' },
    { name: 'Lunch', start_time: '12:45', end_time: '13:30' },
    { name: '5th Period', start_time: '13:30', end_time: '14:30' },
    { name: '6th Period', start_time: '14:45', end_time: '15:45' }
  ]);
  
  // Step 4: Departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsData] = useState([
    'Mathematics',
    'Science',
    'Languages',
    'Arts',
    'Physical Education',
    'Social Studies',
    'Technology'
  ]);

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const [yearsResponse, termsResponse, periodsResponse, departmentsResponse] = await Promise.all([
        apiService.getSchoolYears(),
        apiService.getTerms(),
        apiService.getPeriods(),
        apiService.getDepartments()
      ]);

      if (yearsResponse.success) {
        const yearsData = (yearsResponse.data as any)?.message || yearsResponse.data;
        setSchoolYears(Array.isArray(yearsData) ? yearsData : []);
      }

      if (termsResponse.success) {
        const termsData = (termsResponse.data as any)?.message || termsResponse.data;
        setTerms(Array.isArray(termsData) ? termsData : []);
      }

      if (periodsResponse.success) {
        const periodsData = (periodsResponse.data as any)?.message || periodsResponse.data;
        setPeriods(Array.isArray(periodsData) ? periodsData : []);
      }

      if (departmentsResponse.success) {
        const departmentsData = (departmentsResponse.data as any)?.message || departmentsResponse.data;
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      }
    } catch (err) {
      console.error('Error fetching existing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const steps: WizardStep[] = ['welcome', 'academic-year', 'terms', 'periods', 'departments', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: WizardStep[] = ['welcome', 'academic-year', 'terms', 'periods', 'departments', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleCreateSchoolYear = async () => {
    if (!newYearName || !newStartDate || !newEndDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.createSchoolYear({
        year_name: newYearName,
        start_date: newStartDate,
        end_date: newEndDate
      });

      if (response.success) {
        alert('School year created successfully!');
        setNewYearName('');
        setNewStartDate('');
        setNewEndDate('');
        fetchExistingData();
      } else {
        setError(response.error || 'Failed to create school year');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating school year:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTerms = async () => {
    if (!selectedYearForTerms) {
      setError('Please select a school year');
      return;
    }

    try {
      setLoading(true);
      const selectedYear = schoolYears.find(year => year._id === selectedYearForTerms);
      if (!selectedYear) {
        setError('Selected school year not found');
        return;
      }

      // Calculate term dates
      const yearStart = new Date(selectedYear.start_date);
      const yearEnd = new Date(selectedYear.end_date);
      const yearDuration = yearEnd.getTime() - yearStart.getTime();
      const termDuration = yearDuration / termCount;

      const newTerms = [];
      for (let i = 0; i < termCount; i++) {
        const termStart = new Date(yearStart.getTime() + (i * termDuration));
        const termEnd = new Date(yearStart.getTime() + ((i + 1) * termDuration));
        
        newTerms.push({
          year_id: selectedYear._id,
          term_number: i + 1,
          start_date: termStart.toISOString().split('T')[0],
          end_date: termEnd.toISOString().split('T')[0]
        });
      }

      // Create terms
      for (const term of newTerms) {
        await apiService.createTerm(term);
      }

      alert(`${termCount} terms created successfully!`);
      fetchExistingData();
    } catch (err) {
      setError('Network error occurred');
      console.error('Error generating terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriods = async () => {
    if (!selectedYearForPeriods) {
      setError('Please select a school year');
      return;
    }

    try {
      setLoading(true);
      
      for (const period of periodsData) {
        await apiService.createPeriod({
          year_id: selectedYearForPeriods,
          name: period.name,
          start_time: period.start_time,
          end_time: period.end_time
        });
      }

      alert(`${periodsData.length} periods created successfully!`);
      fetchExistingData();
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating periods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartments = async () => {
    try {
      setLoading(true);
      
      for (const deptName of departmentsData) {
        await apiService.createDepartment({
          department_name: deptName
        });
      }

      alert(`${departmentsData.length} departments created successfully!`);
      fetchExistingData();
    } catch (err) {
      setError('Network error occurred');
      console.error('Error creating departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h2>🎓 Academic Setup Wizard</h2>
              <p>Welcome to the Academic Setup Wizard! This guided process will help you set up your school's academic structure.</p>
            </div>
            
            <div className="wizard-content">
              <div className="setup-overview">
                <h3>What we'll set up:</h3>
                <ul className="setup-checklist">
                  <li>📅 <strong>Academic Years</strong> - Define your school years (2026, 2027, etc.)</li>
                  <li>📚 <strong>Terms</strong> - Create semesters or quarters for each year</li>
                  <li>⏰ <strong>Periods</strong> - Define daily class periods and schedules</li>
                  <li>🏢 <strong>Departments</strong> - Organize subjects into academic departments</li>
                </ul>
              </div>
              
              <div className="current-status">
                <h3>Current Setup Status:</h3>
                <div className="status-grid">
                  <div className="status-item">
                    <span className="status-icon">📅</span>
                    <span>School Years: {schoolYears.length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">📚</span>
                    <span>Terms: {terms.length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">⏰</span>
                    <span>Periods: {periods.length}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">🏢</span>
                    <span>Departments: {departments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic-year':
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h2>📅 Academic Year Setup</h2>
              <p>Create academic years for your school. Each academic year represents a full school year with start and end dates.</p>
            </div>
            
            <div className="wizard-content">
              <div className="existing-items">
                <h3>Existing School Years ({schoolYears.length})</h3>
                {schoolYears.length === 0 ? (
                  <p className="no-items">No school years created yet.</p>
                ) : (
                  <div className="items-grid">
                    {schoolYears.map((year) => (
                      <div key={year._id} className="item-card">
                        <h4>{year.year_name}</h4>
                        <p>Start: {new Date(year.start_date).toLocaleDateString()}</p>
                        <p>End: {new Date(year.end_date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="create-form">
                <h3>Create New School Year</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateSchoolYear(); }}>
                  <div className="form-group">
                    <label htmlFor="yearName">Year Name *</label>
                    <input
                      type="text"
                      id="yearName"
                      value={newYearName}
                      onChange={(e) => setNewYearName(e.target.value)}
                      placeholder="e.g., 2026, 2026-2027"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date *</label>
                    <input
                      type="date"
                      id="startDate"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">End Date *</label>
                    <input
                      type="date"
                      id="endDate"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create School Year'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h2>📚 Term Generation</h2>
              <p>Generate terms (semesters/quarters) for your academic years. Terms will be automatically distributed across the school year.</p>
            </div>
            
            <div className="wizard-content">
              <div className="existing-items">
                <h3>Existing Terms ({terms.length})</h3>
                {terms.length === 0 ? (
                  <p className="no-items">No terms created yet.</p>
                ) : (
                  <div className="items-grid">
                    {terms.map((term) => (
                      <div key={term._id} className="item-card">
                        <h4>Term {term.term_number}</h4>
                        <p>Start: {new Date(term.start_date).toLocaleDateString()}</p>
                        <p>End: {new Date(term.end_date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="create-form">
                <h3>Generate Terms for School Year</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerateTerms(); }}>
                  <div className="form-group">
                    <label htmlFor="yearSelect">Select School Year *</label>
                    <select
                      id="yearSelect"
                      value={selectedYearForTerms}
                      onChange={(e) => setSelectedYearForTerms(e.target.value)}
                      required
                    >
                      <option value="">Select a school year</option>
                      {schoolYears.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.year_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="termCount">Number of Terms *</label>
                    <select
                      id="termCount"
                      value={termCount}
                      onChange={(e) => setTermCount(parseInt(e.target.value))}
                      required
                    >
                      <option value={2}>2 Terms (Semesters)</option>
                      <option value={3}>3 Terms (Trimesters)</option>
                      <option value={4}>4 Terms (Quarters)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Terms'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'periods':
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h2>⏰ Period Definition</h2>
              <p>Define daily class periods and schedules. You can customize the default schedule or use the provided template.</p>
            </div>
            
            <div className="wizard-content">
              <div className="existing-items">
                <h3>Existing Periods ({periods.length})</h3>
                {periods.length === 0 ? (
                  <p className="no-items">No periods created yet.</p>
                ) : (
                  <div className="items-grid">
                    {periods.map((period) => (
                      <div key={period._id} className="item-card">
                        <h4>{period.name}</h4>
                        <p>{period.start_time} - {period.end_time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="create-form">
                <h3>Create Periods for School Year</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleCreatePeriods(); }}>
                  <div className="form-group">
                    <label htmlFor="yearSelectPeriods">Select School Year *</label>
                    <select
                      id="yearSelectPeriods"
                      value={selectedYearForPeriods}
                      onChange={(e) => setSelectedYearForPeriods(e.target.value)}
                      required
                    >
                      <option value="">Select a school year</option>
                      {schoolYears.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.year_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="periods-preview">
                    <h4>Default Schedule Template:</h4>
                    <div className="periods-list">
                      {periodsData.map((period, index) => (
                        <div key={index} className="period-item">
                          <span className="period-name">{period.name}</span>
                          <span className="period-time">{period.start_time} - {period.end_time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Periods'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'departments':
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h2>🏢 Department Setup</h2>
              <p>Create academic departments to organize your subjects. You can use the default departments or customize them.</p>
            </div>
            
            <div className="wizard-content">
              <div className="existing-items">
                <h3>Existing Departments ({departments.length})</h3>
                {departments.length === 0 ? (
                  <p className="no-items">No departments created yet.</p>
                ) : (
                  <div className="items-grid">
                    {departments.map((dept) => (
                      <div key={dept._id} className="item-card">
                        <h4>{dept.department_name}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="create-form">
                <h3>Create Default Departments</h3>
                <div className="departments-preview">
                  <h4>Default Departments:</h4>
                  <div className="departments-list">
                    {departmentsData.map((dept, index) => (
                      <div key={index} className="department-item">
                        <span className="department-name">{dept}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button onClick={handleCreateDepartments} className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Departments'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="wizard-step">
            <div className="wizard-header">
              <h2>🎉 Setup Complete!</h2>
              <p>Congratulations! You have successfully set up your school's academic structure.</p>
            </div>
            
            <div className="wizard-content">
              <div className="completion-summary">
                <h3>What was created:</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-icon">📅</span>
                    <span>School Years: {schoolYears.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">📚</span>
                    <span>Terms: {terms.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">⏰</span>
                    <span>Periods: {periods.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">🏢</span>
                    <span>Departments: {departments.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="next-steps">
                <h3>Next Steps:</h3>
                <ul>
                  <li>📚 Create subjects and assign them to departments</li>
                  <li>👨‍🏫 Assign teachers to departments</li>
                  <li>👥 Assign students to year levels</li>
                  <li>📋 Create classes and schedules</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepNumber = () => {
    const steps = ['welcome', 'academic-year', 'terms', 'periods', 'departments', 'completion'];
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => 6;

  if (loading && currentStep === 'welcome') {
    return <div className="loading">Loading academic setup data...</div>;
  }

  return (
    <div className="academic-setup-wizard">
      <div className="wizard-container">
        {/* Progress Bar */}
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {getStepNumber()} of {getTotalSteps()}
          </div>
        </div>

        {/* Step Content */}
        <div className="wizard-main">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)} className="error-close">×</button>
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          <button 
            onClick={handlePreviousStep}
            disabled={currentStep === 'welcome'}
            className="btn btn-secondary"
          >
            ← Previous
          </button>
          
          <div className="step-indicator">
            {['welcome', 'academic-year', 'terms', 'periods', 'departments', 'completion'].map((step, index) => (
              <div 
                key={step}
                className={`step-dot ${currentStep === step ? 'active' : ''} ${index < ['welcome', 'academic-year', 'terms', 'periods', 'departments', 'completion'].indexOf(currentStep) ? 'completed' : ''}`}
              ></div>
            ))}
          </div>
          
          {currentStep !== 'completion' && (
            <button 
              onClick={handleNextStep}
              className="btn btn-primary"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicSetupWizard;
