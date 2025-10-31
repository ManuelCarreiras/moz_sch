import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useUser } from '../contexts/AuthContext';

interface Class {
  _id: string;
  class_name: string;
  subject_id?: string;
  subject_name?: string;
  teacher_name?: string;
  period_name?: string;
  day_of_week?: number;
  period_start?: string;
  period_end?: string;
  classroom_name?: string;
  term_number?: number;
  year_name?: string;
  year_level_id?: string;
  year_level_name?: string;
  year_level_order?: number;
}

interface TimetableData {
  year_level_id: string;
  year_level_name: string;
  year_level_order: number;
  timetable: Class[];
  all_periods?: any[];
}

interface Term {
  _id: string;
  term_number: number;
  year_id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

interface Year {
  _id: string;
  year_name: string;
  start_date: string;
  end_date: string;
}

export function StudentSchedule() {
  const user = useUser();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTerms, setAvailableTerms] = useState<Term[]>([]);
  const [availableYears, setAvailableYears] = useState<Year[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedYearId, setSelectedYearId] = useState<string>('');

  const loadStudentTimetable = useCallback(async (termId?: string, yearId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get user info
      if (!user?.id) {
        setError('Unable to identify student. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Call the new student schedule API - let the API find the student by email
      let url = `/student/schedule`;
      const params = new URLSearchParams();
      if (termId) params.append('term_id', termId);
      if (yearId) params.append('year_id', yearId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await apiService.get<any>(url);

      if (response.success && response.data) {
        // API returns data in message field
        const data: any = (response.data as any).message || response.data;
        
        // Extract year level info from first class if available
        const firstClass = data.timetable && data.timetable.length > 0 ? data.timetable[0] : null;
        
        // Set timetable data
        setTimetable({
          year_level_id: firstClass?.year_level_id || '',
          year_level_name: firstClass?.year_level_name || '',
          year_level_order: firstClass?.year_level_order || 0,
          timetable: data.timetable || [],
          all_periods: data.all_periods || []
        });
        
        // Set available filters
        setAvailableTerms(data.available_terms || []);
        setAvailableYears(data.available_years || []);
      } else {
        setError('Unable to load timetable.');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading student timetable:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load timetable on mount or when filters change
  useEffect(() => {
    loadStudentTimetable(selectedTermId || undefined, selectedYearId || undefined);
  }, [selectedTermId, selectedYearId, loadStudentTimetable]);

  // Organize classes into a grid by period and day of week
  const organizeTimetableGrid = (): { periods: string[]; periodMap: Map<string, { start: string; end: string }>; classes: Map<string, Class> } | null => {
    if (!timetable) return null;

    const periodMap = new Map<string, { start: string; end: string }>();
    const classesByPeriodDay = new Map<string, Class>();

    // Use all_periods from API to build the grid
    if (timetable.all_periods && timetable.all_periods.length > 0) {
      timetable.all_periods.forEach(period => {
        periodMap.set(period.name, {
          start: period.start_time,
          end: period.end_time
        });
      });
    }

    // Map classes to their periods and days
    if (timetable.timetable) {
      timetable.timetable.forEach(classItem => {
        if (classItem.period_name && classItem.day_of_week) {
          const key = `${classItem.period_name}_${classItem.day_of_week}`;
          classesByPeriodDay.set(key, classItem);
          
          // Add period info if not already added
          if (classItem.period_start && classItem.period_end && !periodMap.has(classItem.period_name)) {
            periodMap.set(classItem.period_name, {
              start: classItem.period_start,
              end: classItem.period_end
            });
          }
        }
      });
    }

    // Get sorted list of periods
    const periods = Array.from(periodMap.entries()).sort((a, b) => {
      return new Date(a[1].start).getTime() - new Date(b[1].start).getTime();
    });

    return {
      periods: periods.map(([name]) => name),
      periodMap,
      classes: classesByPeriodDay
    };
  };

  if (loading) {
    return (
      <div className="student-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p>Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-content">
        <h2>Schedule</h2>
        <p>Check your class schedule and upcoming assignments.</p>
        <div className="error-message" style={{ marginTop: 'var(--space-md)' }}>
          {error}
        </div>
      </div>
    );
  }

  const grid = organizeTimetableGrid();
  const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (!timetable || !grid || grid.periods.length === 0) {
    return (
      <div className="student-content">
        <h2>Schedule</h2>
        <p>Check your class schedule and upcoming assignments.</p>
        <div className="placeholder-content" style={{ marginTop: 'var(--space-md)' }}>
          <p>No schedule available yet. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-content">
      <h2>Schedule</h2>
      <p>Check your class schedule and upcoming assignments.</p>

      {timetable && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          {/* Filter controls */}
          <div style={{ 
            marginBottom: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            display: 'flex',
            gap: 'var(--space-md)',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <label htmlFor="year-filter" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Year:
              </label>
              <select
                id="year-filter"
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: '0.25rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year._id} value={year._id} style={{ background: 'var(--card)', color: 'var(--text)' }}>
                    {year.year_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <label htmlFor="term-filter" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Term:
              </label>
              <select
                id="term-filter"
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: '0.25rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Terms</option>
                {availableTerms.map((term) => (
                  <option key={term._id} value={term._id} style={{ background: 'var(--card)', color: 'var(--text)' }}>
                    {term.year_name} - Term {term.term_number}
                  </option>
                ))}
              </select>
            </div>

            {(selectedTermId || selectedYearId) && (
              <button
                onClick={() => {
                  setSelectedTermId('');
                  setSelectedYearId('');
                }}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: '0.25rem',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div style={{ 
            marginBottom: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <strong>Class:</strong> {timetable.year_level_name || 'No class assigned'}
          </div>

          <div style={{ overflowX: 'auto', marginTop: 'var(--space-lg)' }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--card)',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ background: 'var(--primary)', color: 'white' }}>
                  <th style={{ padding: 'var(--space-md)', textAlign: 'left', minWidth: '120px', maxWidth: '120px' }}>
                    Time
                  </th>
                  {dayNames.map((dayName, idx) => (
                    <th key={idx} style={{ padding: 'var(--space-md)', textAlign: 'center', minWidth: '150px', maxWidth: '150px' }}>
                      {dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.periods.map((periodName: string, idx: number) => {
                  const periodInfo = grid.periodMap.get(periodName);
                  const timeRange = periodInfo 
                    ? `${new Date(periodInfo.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(periodInfo.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : '';
                  
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ 
                        padding: 'var(--space-md)', 
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        maxWidth: '120px',
                        whiteSpace: 'nowrap',
                        background: 'var(--surface)'
                      }}>
                        {timeRange || '—'}
                      </td>
                      {daysOfWeek.map(day => {
                        const classItem = grid.classes.get(`${periodName}_${day}`);
                        return (
                          <td 
                            key={day} 
                            style={{ 
                              padding: 'var(--space-md)', 
                              textAlign: 'center',
                              verticalAlign: 'top',
                              minHeight: '80px',
                              maxWidth: '150px'
                            }}
                          >
                            {classItem ? (
                              <div style={{
                                padding: 'var(--space-sm)',
                                background: 'var(--surface)',
                                borderRadius: '0.25rem',
                                border: '1px solid var(--primary)'
                              }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {classItem.subject_name || classItem.class_name}
                                </div>
                                {classItem.teacher_name && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    👨‍🏫 {classItem.teacher_name}
                                  </div>
                                )}
                                {classItem.classroom_name && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    🏫 {classItem.classroom_name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
