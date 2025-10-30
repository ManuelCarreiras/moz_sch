import { useState, useEffect } from 'react';
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
}

interface TimetableData {
  year_level_id: string;
  year_level_name: string;
  year_level_order: number;
  timetable: Class[];
  all_periods?: any[];
}

export function StudentSchedule() {
  const user = useUser();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentTimetable();
  }, []);

  const loadStudentTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Get student's year level assignment
      // Try to get student year level assignments using user email or ID
      if (!user?.email) {
        setError('Unable to identify student. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Step 2: Get all students and find one matching the user email (if there's a mapping)
      // OR: Get student classes directly - but we need student_id
      // For now, let's try getting all student classes and filtering
      // Actually, a better approach: get student year level assignments
      
      // Try to get student year levels - if user.id maps to student._id
      let studentYearLevels;
      let yearLevelId: string | null = null;
      
      try {
        // Try using user.id as student_id
        const yearLevelResponse = await apiService.getStudentYearLevelAssignments(user.id);
        if (yearLevelResponse.success) {
          studentYearLevels = (yearLevelResponse.data as any)?.message || yearLevelResponse.data;
          if (Array.isArray(studentYearLevels) && studentYearLevels.length > 0) {
            // Use the level_id from the first assignment
            yearLevelId = studentYearLevels[0]._id; // This is the year level _id
          }
        }
      } catch (err) {
        console.log('Could not get student year level by user ID, trying alternative...');
      }

      // Alternative: Get student's enrolled classes if year level not found
      if (!yearLevelId) {
        // Fallback: Get student classes and extract year_level_id from classes
        const studentClassesResponse = await apiService.getStudentClasses();
        
        if (studentClassesResponse.success) {
          const studentClasses = (studentClassesResponse.data as any)?.message || studentClassesResponse.data;
          const classesArray = Array.isArray(studentClasses) ? studentClasses : [];

          if (classesArray.length > 0) {
            // Get the class details to find year_level_id
            const firstClassId = classesArray[0].class_id;
            const classResponse = await apiService.getClass(firstClassId);

            if (classResponse.success) {
              const classData = (classResponse.data as any)?.message || classResponse.data;
              yearLevelId = classData.year_level_id;
            }
          }
        }
      }

      if (!yearLevelId) {
        setError('You are not enrolled in any classes yet. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Step 3: Load timetable for that year level
      const timetableResponse = await apiService.getTimetable(yearLevelId);

      if (timetableResponse.success) {
        const timetableData = (timetableResponse.data as any)?.message || timetableResponse.data;
        setTimetable(timetableData);
      } else {
        setError('Unable to load timetable.');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading student timetable:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ 
            marginBottom: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <strong>Class:</strong> {timetable.year_level_name}
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
