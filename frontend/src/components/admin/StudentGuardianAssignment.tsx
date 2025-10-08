import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

export interface Student {
  _id: string;
  given_name: string;
  middle_name?: string;
  surname: string;
  date_of_birth: string;
  gender: string;
  enrollment_date: string;
}

export interface Guardian {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
}

export interface GuardianType {
  _id: string;
  name: string;
}

interface StudentGuardianAssignmentProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedGuardianId?: string;
}

export function StudentGuardianAssignment({ onClose, onSuccess, preselectedGuardianId }: StudentGuardianAssignmentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [guardianTypes, setGuardianTypes] = useState<GuardianType[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [selectedGuardianType, setSelectedGuardianType] = useState<string>('');
  const [customGuardianType, setCustomGuardianType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [guardianSearchTerm, setGuardianSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchGuardians();
    fetchGuardianTypes();
  }, []);

  useEffect(() => {
    if (preselectedGuardianId && guardians.length > 0) {
      const guardian = guardians.find(g => g._id === preselectedGuardianId);
      if (guardian) {
        setSelectedGuardian(guardian);
      }
    }
  }, [guardians, preselectedGuardianId]);

  useEffect(() => {
    if (searchTerm) {
      fetchStudents();
    }
  }, [searchTerm, currentPage]);

  const fetchGuardians = async () => {
    try {
      const response = await apiService.getGuardians();
      if (response.success) {
        const guardianData = (response.data as any).message || response.data;
        setGuardians(Array.isArray(guardianData) ? guardianData : []);
      }
    } catch (err) {
      console.error('Error fetching guardians:', err);
    }
  };

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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents();
      
      if (response.success) {
        const studentData = (response.data as any).message || response.data;
        let allStudents = Array.isArray(studentData) ? studentData : [];
        
        // Apply search filter
        if (searchTerm) {
          allStudents = allStudents.filter((student: Student) =>
            student.given_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.middle_name && student.middle_name.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        // Get current page items
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageStudents = allStudents.slice(startIndex, endIndex);
        
        setStudents(currentPageStudents);
      } else {
        setError(response.error || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents();
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s._id === student._id);
      if (isSelected) {
        // Remove if already selected
        return prev.filter(s => s._id !== student._id);
      } else {
        // Add if not selected
        return [...prev, student];
      }
    });
  };

  const handleGuardianSelect = (guardian: Guardian) => {
    setSelectedGuardian(guardian);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0 || !selectedGuardian || !selectedGuardianType) {
      setError('Please select at least one student, guardian, and relationship type');
      return;
    }

    // Check if "Other" is selected but no custom type provided
    const selectedType = guardianTypes.find(t => t._id === selectedGuardianType);
    if (selectedType?.name === 'Other' && !customGuardianType.trim()) {
      setError('Please specify the relationship type when "Other" is selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const relationshipText = selectedType?.name === 'Other' ? customGuardianType : selectedType?.name;
      let successCount = 0;
      let errorCount = 0;

      // Create assignments for each selected student
      for (const student of selectedStudents) {
        try {
          const assignmentData = {
            student_id: student._id,
            guardian_id: selectedGuardian._id,
            guardian_type_id: selectedGuardianType,
            ...(selectedType?.name === 'Other' && customGuardianType && {
              custom_relationship: customGuardianType
            })
          };

          const response = await apiService.createStudentGuardian(assignmentData);
          
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Error assigning guardian to student ${student.given_name}:`, err);
        }
      }

      if (successCount > 0) {
        alert(`Guardian ${selectedGuardian.given_name} ${selectedGuardian.surname} assigned to ${successCount} student(s) as ${relationshipText}!${errorCount > 0 ? ` (${errorCount} assignments failed)` : ''}`);
        onSuccess();
        onClose();
      } else {
        setError('Failed to assign guardian to any students');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error assigning guardian to students:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal assignment-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Assign Guardian to Student</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          <form onSubmit={handleSubmit} className="assignment-form">
            {/* Guardian Selection */}
            <div className="selection-section">
              <h3>1. Select Guardian</h3>
              <div className="search-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guardian-search">Search Guardians</label>
                    <input
                      type="text"
                      id="guardian-search"
                      value={guardianSearchTerm}
                      onChange={(e) => setGuardianSearchTerm(e.target.value)}
                      placeholder="Search by name, email, or phone..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="guardians-grid">
                {guardians
                  .filter((guardian) => {
                    if (!guardianSearchTerm) return true;
                    const searchLower = guardianSearchTerm.toLowerCase();
                    return (
                      guardian.given_name.toLowerCase().includes(searchLower) ||
                      guardian.surname.toLowerCase().includes(searchLower) ||
                      guardian.email_address.toLowerCase().includes(searchLower) ||
                      guardian.phone_number.includes(searchLower)
                    );
                  })
                  .map((guardian) => (
                    <div
                      key={guardian._id}
                      className={`guardian-card ${selectedGuardian?._id === guardian._id ? 'selected' : ''}`}
                      onClick={() => handleGuardianSelect(guardian)}
                    >
                      <div className="guardian-info">
                        <h4>{guardian.given_name} {guardian.surname}</h4>
                        <p>{guardian.email_address}</p>
                        <p>{guardian.phone_number}</p>
                      </div>
                      <div className="selection-indicator">
                        {selectedGuardian?._id === guardian._id ? '✓' : ''}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Student Search and Selection */}
            <div className="selection-section">
              <h3>2. Search and Select Student</h3>
              <form onSubmit={handleSearch} className="search-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="search">Search Students</label>
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name..."
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn--secondary">
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {searchTerm && (
                <div className="students-grid">
                  {students.map((student) => {
                    const isSelected = selectedStudents.some(s => s._id === student._id);
                    return (
                      <div
                        key={student._id}
                        className={`student-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="student-info">
                          <h4>{student.given_name} {student.middle_name} {student.surname}</h4>
                          <p>ID: {student._id.substring(0, 8)}...</p>
                          <p>Gender: {student.gender}</p>
                          <p>Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}</p>
                        </div>
                        <div className="selection-indicator">
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Selected Students Summary */}
              {selectedStudents.length > 0 && (
                <div className="selected-students-summary">
                  <h4>Selected Students ({selectedStudents.length}):</h4>
                  <div className="selected-students-list">
                    {selectedStudents.map((student) => (
                      <div key={student._id} className="selected-student-item">
                        <span>{student.given_name} {student.middle_name} {student.surname}</span>
                        <button 
                          type="button"
                          className="btn btn--small btn--danger"
                          onClick={() => handleStudentSelect(student)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Guardian Type Selection */}
            <div className="selection-section">
              <h3>3. Select Relationship Type</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="guardian_type">Relationship Type *</label>
                  <select
                    id="guardian_type"
                    value={selectedGuardianType}
                    onChange={(e) => {
                      setSelectedGuardianType(e.target.value);
                      setCustomGuardianType(''); // Clear custom type when selecting predefined
                    }}
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
              
              {/* Custom Guardian Type Input - only show when "Other" is selected */}
              {selectedGuardianType && guardianTypes.find(t => t._id === selectedGuardianType)?.name === 'Other' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="custom_guardian_type">Specify Relationship *</label>
                    <input
                      type="text"
                      id="custom_guardian_type"
                      value={customGuardianType}
                      onChange={(e) => setCustomGuardianType(e.target.value)}
                      placeholder="e.g., Legal Guardian, Uncle, Aunt..."
                      required
                    />
                  </div>
                </div>
              )}
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedStudents.length === 0 || !selectedGuardian || !selectedGuardianType}
                className="btn btn--primary"
              >
                {loading ? 'Assigning...' : `Assign Guardian to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
