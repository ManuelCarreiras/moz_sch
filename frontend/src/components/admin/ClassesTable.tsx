import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

export interface Class {
  _id: string;
  subject_id: string;
  teacher_id: string;
  term_id: string;
  period_id: string;
  classroom_id: string;
  year_level_id: string;
  class_name: string;
  subject_name?: string;
  teacher_name?: string;
  term_number?: number;
  period_name?: string;
  room_name?: string;
  classroom_name?: string;
  year_level_name?: string;
}

interface Term {
  _id: string;
  year_id: string;
  term_number: number;
  start_date: string;
  end_date: string;
}

interface ClassesTableProps {
  onNavigateToEnrollments?: () => void;
  onNavigateToTimetable?: () => void;
}

export function ClassesTable({ onNavigateToEnrollments, onNavigateToTimetable }: ClassesTableProps = {}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search filters
  const [searchYearId, setSearchYearId] = useState<string>('');
  const [searchTermId, setSearchTermId] = useState<string>('');
  const [searchClassName, setSearchClassName] = useState<string>('');

  useEffect(() => {
    loadTerms();
    loadSchoolYears();
  }, []);

  useEffect(() => {
    // Reset term selection when year changes
    setSearchTermId('');
  }, [searchYearId]);

  const loadTerms = async () => {
    try {
      const termsRes = await apiService.getTerms();

      if (termsRes.success) {
        const termsData = (termsRes.data as any)?.message || termsRes.data;
        setTerms(Array.isArray(termsData) ? termsData : []);
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching data:', err);
    }
  };

  const loadSchoolYears = async () => {
    try {
      const response = await apiService.getSchoolYears();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setSchoolYears(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading school years:', err);
    }
  };

  const searchClasses = async () => {
    if (!searchTermId && !searchClassName) {
      setError('Please select a term or enter a class name to search');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getClasses();
      
      if (response.success) {
        const allClasses = (response.data as any)?.message || response.data;
        const classesArray = Array.isArray(allClasses) ? allClasses : [];
        
        // Filter classes based on search criteria
        let filtered = classesArray;
        
        if (searchTermId) {
          filtered = filtered.filter((c: Class) => c.term_id === searchTermId);
        }
        
        if (searchClassName) {
          const searchLower = searchClassName.toLowerCase();
          filtered = filtered.filter((c: Class) => 
            c.class_name.toLowerCase().includes(searchLower)
          );
        }
        
        setClasses(filtered);
        
        if (filtered.length === 0) {
          setError('No classes found matching your search criteria');
        }
      } else {
        setError('Failed to search classes');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error searching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const response = await apiService.deleteClass(id);
      
      if (response.success) {
        alert('Class deleted successfully!');
        // Refresh search results
        searchClasses();
      } else {
        setError(response.error || 'Failed to delete class');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error deleting class:', err);
    }
  };

  const handleClearSearch = () => {
    setSearchTermId('');
    setSearchClassName('');
    setClasses([]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchClasses();
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
        Loading classes...
      </div>
    );
  }

  return (
    <div className="classes-table">
      <div className="table-header">
        <div className="table-header__title">
          <h3>Class Management</h3>
          <p className="table-description">Search and manage classes. To create classes, use the Timetable view.</p>
        </div>
        <div className="table-header__actions" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {onNavigateToEnrollments && (
            <button 
              className="btn btn--secondary"
              onClick={onNavigateToEnrollments}
            >
              Manage Enrollments
            </button>
          )}
          {onNavigateToTimetable && (
            <button 
              className="btn btn--secondary"
              onClick={onNavigateToTimetable}
            >
              View Timetables
            </button>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div style={{ 
        background: 'var(--card)', 
        padding: 'var(--space-lg)', 
        borderRadius: '0.5rem',
        marginBottom: 'var(--space-lg)',
        border: '1px solid var(--border)'
      }}>
        <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 600 }}>Search Classes</h4>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="search_year" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-xs)',
              fontSize: '0.875rem',
              fontWeight: 500 
            }}>
              School Year:
            </label>
            <select
              id="search_year"
              value={searchYearId}
              onChange={(e) => setSearchYearId(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 'var(--text-base)',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist',
                appearance: 'menulist'
              }}
            >
              <option value="" style={{ background: 'var(--card)', color: 'var(--text)' }}>All Years</option>
              {schoolYears.map((year) => (
                <option 
                  key={year._id} 
                  value={year._id}
                  style={{ background: 'var(--card)', color: 'var(--text)' }}
                >
                  {year.year_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="search_term" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-xs)',
              fontSize: '0.875rem',
              fontWeight: 500 
            }}>
              Term:
            </label>
            <select
              id="search_term"
              value={searchTermId}
              onChange={(e) => setSearchTermId(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 'var(--text-base)',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist',
                appearance: 'menulist'
              }}
            >
              <option value="" style={{ background: 'var(--card)', color: 'var(--text)' }}>All Terms</option>
              {terms
                .filter(term => !searchYearId || String(term.year_id) === String(searchYearId))
                .map((term) => (
                  <option 
                    key={term._id} 
                    value={term._id}
                    style={{ background: 'var(--card)', color: 'var(--text)' }}
                  >
                    Term {term.term_number}
                  </option>
                ))}
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="search_class_name" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-xs)',
              fontSize: '0.875rem',
              fontWeight: 500 
            }}>
              Class Name:
            </label>
            <input
              id="search_class_name"
              type="text"
              placeholder="e.g., 1st A, 2nd B..."
              value={searchClassName}
              onChange={(e) => setSearchClassName(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 'var(--text-base)'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button 
              className="btn btn--primary"
              onClick={searchClasses}
            >
              Search
            </button>
            <button 
              className="btn btn--secondary"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Term</th>
              <th>Period</th>
              <th>Classroom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  {loading ? 'Searching...' : 'No classes found. Use the search form above to find classes.'}
                </td>
              </tr>
            ) : (
              classes.map((classItem) => (
                <tr key={classItem._id}>
                  <td><strong>{classItem.class_name}</strong></td>
                  <td>{classItem.subject_name || 'N/A'}</td>
                  <td>{classItem.teacher_name || 'N/A'}</td>
                  <td>Term {classItem.term_number || 'N/A'}</td>
                  <td>{classItem.period_name || 'N/A'}</td>
                  <td>{classItem.classroom_name || classItem.room_name || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDelete(classItem._id)}
                        className="btn btn--small btn--danger"
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
    </div>
  );
}