import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/apiService';
import { TeacherWizard } from './TeacherWizard';

export interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address: string;
  phone_number: string;
  gender: string;
  year_start?: number;
  academic_level?: string;
  years_of_experience?: number;
  department_id?: string;
  department_name?: string;
}

export function TeachersTable() {
  const { t } = useTranslation();
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
        setError(response.error || t('admin.teachersTable.failedLoad'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
        setError(t('admin.teachersTable.invalidFile'));
        return;
      }
      setImportFile(file);
      setError(null);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setError(t('admin.teachersTable.selectFilePlease'));
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
        setError(response.error || t('admin.teachersTable.failedImport'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
    if (!confirm(t('admin.teachersTable.confirmDelete'))) {
      return;
    }

    try {
      const response = await apiService.deleteTeacher(id);
      if (response.success) {
        await loadTeachers(); // Reload the list
      } else {
        setError(response.error || t('admin.teachersTable.failedDelete'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
        {t('admin.teachersTable.loadingTeachers')}
      </div>
    );
  }

  return (
    <div className="teachers-table">
      <div className="table-header">
        <div className="table-header__title">
          <h2>{t('admin.teachersTable.title')}</h2>
          <p>{t('admin.teachersTable.subtitle')}</p>
        </div>
        <div className="table-header__actions">
          <button 
            className="btn btn--primary"
            onClick={handleImportClick}
            style={{ marginRight: 'var(--space-sm)' }}
          >
            📥 {t('admin.teachersTable.importExcel')}
          </button>
          <button 
            className="btn btn--primary"
            onClick={() => setShowCreateTeacher(true)}
          >
            ➕ {t('admin.teachersTable.addNew')}
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
              <th>{t('common.name')}</th>
              <th>{t('common.email')}</th>
              <th>{t('common.phone')}</th>
              <th>{t('common.gender')}</th>
              <th>{t('common.department')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  {t('admin.teachersTable.noTeachers')}
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
                  <td>{teacher.academic_level ?? '-'}</td>
                  <td>{teacher.years_of_experience ?? '-'}</td>
                  <td>{teacher.department_name || t('common.notAssigned')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn--small btn--secondary">{t('common.edit')}</button>
                      <button 
                        className="btn btn--small btn--danger"
                        onClick={() => handleDeleteTeacher(teacher._id)}
                        title={t('admin.teachersTable.deleteTeacher')}
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
              {t('admin.teachersTable.importTitle')}
            </h2>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                {t('admin.teachersTable.importDesc')}
              </p>
              <ul style={{ 
                color: 'var(--muted)', 
                marginLeft: 'var(--space-lg)',
                marginBottom: 'var(--space-md)'
              }}>
                <li><strong>given_name</strong> - {t('admin.teachersTable.importGivenName')}</li>
                <li><strong>surname</strong> - {t('admin.teachersTable.importSurname')}</li>
                <li><strong>gender</strong> - {t('admin.teachersTable.importGender')}</li>
                <li><strong>email_address</strong> - {t('admin.teachersTable.importEmail')}</li>
                <li><strong>phone_number</strong> - {t('admin.teachersTable.importPhone')}</li>
                <li><strong>year_start</strong> - Start year, e.g. 2020 (required)</li>
                <li><strong>academic_level</strong> - e.g. PhD, Master, Licentiate (required)</li>
                <li><strong>years_of_experience</strong> - Years of experience (required)</li>
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
                  {t('admin.teachersTable.created')} {importResult.summary.total_created} | 
                  {t('admin.teachersTable.failed')} {importResult.summary.total_failed} | 
                  {t('admin.teachersTable.skipped')} {importResult.summary.total_skipped}
                </div>
                {importResult.failed && importResult.failed.length > 0 && (
                  <details style={{ marginTop: 'var(--space-sm)' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                      {t('admin.teachersTable.viewFailed')}
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
                      {t('admin.teachersTable.viewSkipped')}
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
                {t('admin.teachersTable.selectFile')}
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
                  {t('admin.teachersTable.selected', { name: importFile.name, size: (importFile.size / 1024).toFixed(2) })}
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
                {importing ? t('common.importing') : t('admin.teachersTable.importTeachers')}
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
