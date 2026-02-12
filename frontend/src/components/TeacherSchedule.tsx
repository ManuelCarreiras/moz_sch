import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address?: string;
}

export function TeacherSchedule() {
  const { t } = useTranslation();
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAvailableTerms, setAllAvailableTerms] = useState<Term[]>([]);
  const [allAvailableYears, setAllAvailableYears] = useState<Year[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const loadTeachers = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const response = await apiService.getTeachers();
      if (response.success && response.data) {
        const teachersData = (response.data as any)?.message || response.data || [];
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      }
    } catch (err) {
      console.error('Error loading teachers:', err);
    }
  }, [isAdmin]);

  const loadTeacherTimetable = useCallback(async (termId?: string, yearId?: string, teacherId?: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!isAdmin && !user?.id) {
        setError(t('teacher.schedule.unableToIdentify'));
        setLoading(false);
        return;
      }

      let url = `/teacher/schedule`;
      const params = new URLSearchParams();
      if (termId) params.append('term_id', termId);
      if (yearId) params.append('year_id', yearId);
      if (isAdmin && teacherId) params.append('teacher_id', teacherId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await apiService.get<any>(url);

      if (response.success && response.data) {
        const data: any = (response.data as any).message || response.data;
        
        setTimetable({
          timetable: data.timetable || [],
          all_periods: data.all_periods || []
        });
        
        // Set available filters - only update if we're loading without filters (initial load)
        // This preserves all available options even when filtering
        if (!termId && !yearId) {
          setAllAvailableTerms(data.available_terms || []);
          setAllAvailableYears(data.available_years || []);
        }
      } else {
        setError(t('teacher.schedule.unableToLoad'));
      }
    } catch (err) {
      setError(t('common.networkError'));
      console.error('Error loading teacher timetable:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin]);

  // Load teachers for admin
  useEffect(() => {
    if (isAdmin) {
      loadTeachers();
    }
  }, [isAdmin, loadTeachers]);

  // Reset term selection when year changes
  useEffect(() => {
    setSelectedTermId('');
  }, [selectedYearId]);

  // Reset teacher selection when filters change
  useEffect(() => {
    if (!isAdmin) {
      setSelectedTeacherId('');
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTeacherTimetable(
      selectedTermId || undefined, 
      selectedYearId || undefined,
      selectedTeacherId || undefined
    );
  }, [selectedTermId, selectedYearId, selectedTeacherId, loadTeacherTimetable]);

  const organizeTimetableGrid = (): { periods: string[]; periodMap: Map<string, { start: string; end: string }>; classes: Map<string, Class> } | null => {
    if (!timetable) return null;

    const periodMap = new Map<string, { start: string; end: string }>();
    const classesByPeriodDay = new Map<string, Class>();

    if (timetable.all_periods && timetable.all_periods.length > 0) {
      timetable.all_periods.forEach(period => {
        periodMap.set(period.name, {
          start: period.start_time,
          end: period.end_time
        });
      });
    }

    if (timetable.timetable) {
      timetable.timetable.forEach(classItem => {
        if (classItem.period_name && classItem.day_of_week) {
          const key = `${classItem.period_name}_${classItem.day_of_week}`;
          classesByPeriodDay.set(key, classItem);
          
          if (classItem.period_start && classItem.period_end && !periodMap.has(classItem.period_name)) {
            periodMap.set(classItem.period_name, {
              start: classItem.period_start,
              end: classItem.period_end
            });
          }
        }
      });
    }

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
      <div className="teacher-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p>{t('teacher.schedule.loadingSchedule')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-content">
        <h2>My Classes</h2>
        <p>View your assigned classes and teaching schedule.</p>
        <div className="error-message" style={{ marginTop: 'var(--space-md)' }}>
          {error}
        </div>
      </div>
    );
  }

  const grid = organizeTimetableGrid();
  const daysOfWeek = [1, 2, 3, 4, 5];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (!timetable || !grid || grid.periods.length === 0) {
    return (
      <div className="teacher-content">
        <h2>My Classes</h2>
        <p>View your assigned classes and teaching schedule.</p>
        <div className="placeholder-content" style={{ marginTop: 'var(--space-md)' }}>
          <p>No classes assigned yet. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-content">
      <h2>My Classes</h2>
      <p>View your assigned classes and teaching schedule.</p>

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
            {isAdmin && (
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <label htmlFor="teacher-filter" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Teacher:
                </label>
                <select
                  id="teacher-filter"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    minWidth: '200px'
                  }}
                >
                  <option value="">All Teachers</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id} style={{ background: 'var(--card)', color: 'var(--text)' }}>
                      {teacher.given_name} {teacher.surname}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                {allAvailableYears.map((year) => (
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
                {allAvailableTerms
                  .filter(term => !selectedYearId || String(term.year_id) === String(selectedYearId))
                  .map((term) => (
                    <option key={term._id} value={term._id} style={{ background: 'var(--card)', color: 'var(--text)' }}>
                      Term {term.term_number}
                    </option>
                  ))}
              </select>
            </div>

            {(selectedTermId || selectedYearId || selectedTeacherId) && (
              <button
                onClick={() => {
                  setSelectedTermId('');
                  setSelectedYearId('');
                  setSelectedTeacherId('');
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
                                {classItem.year_level_name && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    📚 {classItem.year_level_order && classItem.year_level_order > 0 
                                      ? `${classItem.year_level_order}${getOrdinalSuffix(classItem.year_level_order)} ${classItem.year_level_name}` 
                                      : classItem.year_level_name}
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

