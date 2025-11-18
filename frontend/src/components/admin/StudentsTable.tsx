import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { StudentWizard } from './StudentWizard';

export interface Student {
  _id: string;
  given_name: string;
  middle_name: string;
  surname: string;
  email: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  enrollment_date: string;
  is_active: boolean;
}

export function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStudents();
      
      if (response.success && response.data) {
        // The backend returns { success: true, message: [...] } format
        const studentData = (response.data as any).message || response.data;
        setStudents(Array.isArray(studentData) ? studentData : []);
      } else {
        setError(response.error || 'Failed to load students');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCreated = () => {
    loadStudents(); // Reload the list
    setShowWizard(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await apiService.deleteStudent(id);
      if (response.success) {
        await loadStudents(); // Reload the list
      } else {
        setError(response.error || 'Failed to delete student');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting student:', err);
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    setImportFile(null);
    setImportResult(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!validExtensions.includes(fileExtension)) {
        setError('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setImportFile(file);
      setError(null);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const response = await apiService.importStudentsFromExcel(importFile);
      if (response.success) {
        setImportResult(response.data);
        await loadStudents(); // Reload the list
        // Close modal after a short delay
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportResult(null);
        }, 3000);
      } else {
        setError(response.error || 'Failed to import students');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error importing students:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    if (!importing) {
      setShowImportModal(false);
      setImportFile(null);
      setImportResult(null);
      setError(null);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    `${student.given_name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Loading students...
      </div>
    );
  }

  return (
    <div className="students-table">
      {/* Header */}
      <div className="table-header">
        <div className="table-header__title">
          <h2>Student Management</h2>
          <p>Manage student records, enrollment, and academic progress</p>
        </div>
        <div className="table-header__actions">
          <button 
            className="btn btn--primary"
            onClick={handleImportClick}
            style={{ marginRight: 'var(--space-sm)' }}
          >
            📥 Import from Excel
          </button>
          <button 
            className="btn btn--primary"
            onClick={() => setShowWizard(true)}
          >
            ➕ Add New Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="table-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="table-stats">
          <span>Total: {filteredStudents.length} students</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date of Birth</th>
              <th>Status</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student._id}>
                  <td>
                    <div className="student-name">
                      <strong>{student.given_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.surname}</strong>
                      <span className="student-gender">
                        {student.gender === 'Male' ? '♂' : '♀'}
                      </span>
                    </div>
                  </td>
                  <td>{student.email || 'N/A'}</td>
                  <td>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-badge--${student.is_active ? 'active' : 'inactive'}`}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn--small btn--danger"
                        onClick={() => handleDeleteStudent(student._id)}
                        title="Delete student"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--small"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn--small"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Student Wizard Modal */}
      {showWizard && (
        <StudentWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleStudentCreated}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseImportModal}
        >
          <div 
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>
              Import Students from Excel
            </h2>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                Upload an Excel file (.xlsx or .xls) with the following columns:
              </p>
              <ul style={{ 
                color: 'var(--muted)', 
                marginLeft: 'var(--space-lg)',
                marginBottom: 'var(--space-md)'
              }}>
                <li><strong>given_name</strong> - First name (required)</li>
                <li><strong>middle_name</strong> - Middle name (optional)</li>
                <li><strong>surname</strong> - Last name (required)</li>
                <li><strong>date_of_birth</strong> - Date of birth (required, format: YYYY-MM-DD or DD/MM/YYYY)</li>
                <li><strong>gender</strong> - Male or Female (required)</li>
                <li><strong>enrollment_date</strong> - Enrollment date (required, format: YYYY-MM-DD or DD/MM/YYYY)</li>
                <li><strong>email</strong> - Email address (optional, must be unique)</li>
              </ul>
            </div>

            {error && (
              <div style={{
                padding: 'var(--space-sm)',
                marginBottom: 'var(--space-md)',
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: 'var(--radius)',
                color: '#ff3b30'
              }}>
                {error}
              </div>
            )}

            {importResult && (
              <div style={{
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
                backgroundColor: importResult.summary.total_failed > 0 
                  ? 'rgba(255, 193, 7, 0.1)' 
                  : 'rgba(52, 199, 89, 0.1)',
                border: `1px solid ${importResult.summary.total_failed > 0 
                  ? 'rgba(255, 193, 7, 0.3)' 
                  : 'rgba(52, 199, 89, 0.3)'}`,
                borderRadius: 'var(--radius)',
                color: importResult.summary.total_failed > 0 ? '#ffc107' : '#34c759'
              }}>
                <strong>{importResult.message}</strong>
                <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)' }}>
                  Created: {importResult.summary.total_created} | 
                  Failed: {importResult.summary.total_failed} | 
                  Skipped: {importResult.summary.total_skipped}
                </div>
                {importResult.failed && importResult.failed.length > 0 && (
                  <details style={{ marginTop: 'var(--space-sm)' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                      View failed rows
                    </summary>
                    <ul style={{ marginLeft: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                      {importResult.failed.map((item: any, idx: number) => (
                        <li key={idx}>Row {item.row}: {item.reason}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {importResult.skipped && importResult.skipped.length > 0 && (
                  <details style={{ marginTop: 'var(--space-sm)' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                      View skipped rows
                    </summary>
                    <ul style={{ marginLeft: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                      {importResult.skipped.map((item: any, idx: number) => (
                        <li key={idx}>Row {item.row}: {item.reason}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 'var(--space-sm)',
                fontWeight: '500'
              }}>
                Select Excel File:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={importing}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
              {importFile && (
                <div style={{ 
                  marginTop: 'var(--space-sm)', 
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted)'
                }}>
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 'var(--space-sm)'
            }}>
              <button
                className="btn"
                onClick={handleCloseImportModal}
                disabled={importing}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={handleImportSubmit}
                disabled={!importFile || importing}
              >
                {importing ? 'Importing...' : 'Import Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
