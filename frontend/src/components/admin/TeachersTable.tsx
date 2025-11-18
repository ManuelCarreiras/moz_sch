import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { TeacherWizard } from './TeacherWizard';

export interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
  gender: string;
  department_id?: string;
  department_name?: string;
}

export function TeachersTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeachers();
      
      if (response.success && response.data) {
        // The backend returns { success: true, message: [...] } format
        const teacherData = (response.data as any).message || response.data;
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } else {
        setError(response.error || 'Failed to load teachers');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading teachers:', err);
    } finally {
      setLoading(false);
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
      const response = await apiService.importTeachersFromExcel(importFile);
      if (response.success) {
        setImportResult(response.data);
        await loadTeachers(); // Reload the list
        // Close modal after a short delay
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportResult(null);
        }, 3000);
      } else {
        setError(response.error || 'Failed to import teachers');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error importing teachers:', err);
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

  const handleTeacherCreated = () => {
    loadTeachers(); // Reload the teacher list
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      const response = await apiService.deleteTeacher(id);
      if (response.success) {
        await loadTeachers(); // Reload the list
      } else {
        setError(response.error || 'Failed to delete teacher');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting teacher:', err);
    }
  };

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
        Loading teachers...
      </div>
    );
  }

  return (
    <div className="teachers-table">
      <div className="table-header">
        <div className="table-header__title">
          <h2>Teacher Management</h2>
          <p>Manage teacher profiles, assignments, and department information</p>
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
            onClick={() => setShowCreateTeacher(true)}
          >
            ➕ Add New Teacher
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>
                    <div className="teacher-name">
                      <strong>{teacher.given_name} {teacher.surname}</strong>
                    </div>
                  </td>
                  <td>{teacher.email_address}</td>
                  <td>{teacher.phone_number}</td>
                  <td>
                    <span className="teacher-gender">
                      {teacher.gender === 'Male' ? '♂' : teacher.gender === 'Female' ? '♀' : '⚧'}
                    </span>
                    {teacher.gender}
                  </td>
                  <td>{teacher.department_name || 'Not Assigned'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn--small btn--secondary">Edit</button>
                      <button 
                        className="btn btn--small btn--danger"
                        onClick={() => handleDeleteTeacher(teacher._id)}
                        title="Delete teacher"
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
              Import Teachers from Excel
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
                <li><strong>surname</strong> - Last name (required)</li>
                <li><strong>gender</strong> - Male or Female (required)</li>
                <li><strong>email_address</strong> - Email address (required, must be unique)</li>
                <li><strong>phone_number</strong> - Phone number (required)</li>
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
                {importing ? 'Importing...' : 'Import Teachers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      {showCreateTeacher && (
        <TeacherWizard
          onClose={() => setShowCreateTeacher(false)}
          onSuccess={() => {
            handleTeacherCreated();
            setShowCreateTeacher(false);
          }}
        />
      )}
    </div>
  );
}
