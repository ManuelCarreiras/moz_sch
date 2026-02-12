import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        setError(response.error || t('admin.studentsTable.failedLoad'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
    if (!confirm(t('admin.studentsTable.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteStudent(id);
      if (response.success) {
        await loadStudents(); // Reload the list
      } else {
        setError(response.error || t('admin.studentsTable.failedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
        setError(t('admin.studentsTable.invalidFile'));
        return;
      }
      setImportFile(file);
      setError(null);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setError(t('admin.studentsTable.selectFilePlease'));
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
        setError(response.error || t('admin.studentsTable.failedImport'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
        {t('admin.studentsTable.loadingStudents')}
      </div>
    );
  }

  return (
    <div className="students-table">
      {/* Header */}
      <div className="table-header">
        <div className="table-header__title">
          <h2>{t('admin.studentsTable.title')}</h2>
          <p>{t('admin.studentsTable.subtitle')}</p>
        </div>
        <div className="table-header__actions">
          <button 
            className="btn btn--primary"
            onClick={handleImportClick}
            style={{ marginRight: 'var(--space-sm)' }}
          >
            📥 {t('admin.studentsTable.importExcel')}
          </button>
          <button 
            className="btn btn--primary"
            onClick={() => setShowWizard(true)}
          >
            ➕ {t('admin.studentsTable.addNew')}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="table-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('admin.studentsTable.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="table-stats">
          <span>{t('common.totalCount', { count: filteredStudents.length })}</span>
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
              <th>{t('common.name')}</th>
              <th>{t('common.email')}</th>
              <th>{t('common.dateOfBirth')}</th>
              <th>{t('common.status')}</th>
              <th>{t('admin.studentsTable.enrollmentDate')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  {searchTerm ? t('admin.studentsTable.noStudentsSearch') : t('admin.studentsTable.noStudents')}
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
                  <td>{student.email || t('common.na')}</td>
                  <td>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : t('common.na')}</td>
                  <td>
                    <span className={`status-badge status-badge--${student.is_active ? 'active' : 'inactive'}`}>
                      {student.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : t('common.na')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn--small btn--danger"
                        onClick={() => handleDeleteStudent(student._id)}
                        title={t('admin.studentsTable.deleteStudent')}
                      >
                        {t('common.delete')}
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
            {t('common.previous')}
          </button>
          <span className="pagination-info">
            {t('common.pageOf', { current: currentPage, total: totalPages })}
          </span>
          <button
            className="btn btn--small"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            {t('common.next')}
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
              {t('admin.studentsTable.importTitle')}
            </h2>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                {t('admin.studentsTable.importDesc')}
              </p>
              <ul style={{ 
                color: 'var(--muted)', 
                marginLeft: 'var(--space-lg)',
                marginBottom: 'var(--space-md)'
              }}>
                <li><strong>given_name</strong> - {t('admin.studentsTable.importGivenName')}</li>
                <li><strong>middle_name</strong> - {t('admin.studentsTable.importMiddleName')}</li>
                <li><strong>surname</strong> - {t('admin.studentsTable.importSurname')}</li>
                <li><strong>date_of_birth</strong> - {t('admin.studentsTable.importDob')}</li>
                <li><strong>gender</strong> - {t('admin.studentsTable.importGender')}</li>
                <li><strong>enrollment_date</strong> - {t('admin.studentsTable.importEnrollment')}</li>
                <li><strong>email</strong> - {t('admin.studentsTable.importEmail')}</li>
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
                  {t('admin.studentsTable.created')} {importResult.summary.total_created} | 
                  {t('admin.studentsTable.failed')} {importResult.summary.total_failed} | 
                  {t('admin.studentsTable.skipped')} {importResult.summary.total_skipped}
                </div>
                {importResult.failed && importResult.failed.length > 0 && (
                  <details style={{ marginTop: 'var(--space-sm)' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                      {t('admin.studentsTable.viewFailed')}
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
                      {t('admin.studentsTable.viewSkipped')}
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
                {t('admin.studentsTable.selectFile')}
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
                  {t('admin.studentsTable.selected', { name: importFile.name, size: (importFile.size / 1024).toFixed(2) })}
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
                {t('common.cancel')}
              </button>
              <button
                className="btn btn--primary"
                onClick={handleImportSubmit}
                disabled={!importFile || importing}
              >
                {importing ? t('common.importing') : t('admin.studentsTable.importStudents')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
