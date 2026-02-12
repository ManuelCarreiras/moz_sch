import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

interface StudentSelectorProps {
  onSelect: (student: Student) => void;
  onClose: () => void;
  preselectedStudentId?: string;
}

export function StudentSelector({ onSelect, onClose, preselectedStudentId }: StudentSelectorProps) {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (preselectedStudentId) {
      // Pre-select the student if provided
      const student = students.find(s => s._id === preselectedStudentId);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [students, preselectedStudentId]);

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
        
        // Calculate pagination
        const totalItems = allStudents.length;
        const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(totalPagesCount);
        
        // Get current page items
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageStudents = allStudents.slice(startIndex, endIndex);
        
        setStudents(currentPageStudents);
      } else {
        setError(response.error || t('admin.studentSelector.failedFetch'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleConfirmSelection = () => {
    if (selectedStudent) {
      onSelect(selectedStudent);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchStudents();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__dialog">
          <div className="modal__content">
            <div className="loading">{t('admin.studentSelector.loadingStudents')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{t('admin.studentSelector.title')}</h2>
          <button className="icon-btn" aria-label={t('common.close')} onClick={onClose}>✕</button>
        </div>

        <div className="modal__content">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="search">{t('admin.studentSelector.searchStudents')}</label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin.studentSelector.searchByName')}
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn--secondary">
                  {t('common.search')}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="student-list">
            <h3>{t('admin.studentSelector.studentsFound', { count: students.length })}</h3>
            
            {students.length === 0 ? (
              <div className="no-data">
                {t('admin.studentSelector.noStudentsFound')}
              </div>
            ) : (
              <>
                <div className="students-grid">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className={`student-card ${selectedStudent?._id === student._id ? 'selected' : ''}`}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="student-info">
                        <h4>{student.given_name} {student.middle_name} {student.surname}</h4>
                        <p>{t('admin.studentSelector.id')} {student._id.substring(0, 8)}...</p>
                        <p>{t('admin.studentSelector.gender')} {student.gender}</p>
                        <p>{t('admin.studentSelector.enrolled')} {new Date(student.enrollment_date).toLocaleDateString()}</p>
                      </div>
                      <div className="selection-indicator">
                        {selectedStudent?._id === student._id ? '✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn--secondary"
                    >
                      ← {t('common.previous')}
                    </button>
                    
                    <span className="pagination-info">
                      {t('common.pageOf', { current: currentPage, total: totalPages })}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn--secondary"
                    >
                      {t('common.next')} →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedStudent}
              className="btn btn--primary"
            >
              {t('admin.studentSelector.title')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
