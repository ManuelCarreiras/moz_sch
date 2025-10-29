import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface YearLevelTimetableProps {
  onBack: () => void;
}

interface YearLevel {
  _id: string;
  level_name: string;
  level_order: number;
}

interface Subject {
  _id: string;
  subject_name: string;
  department_id: string;
}

interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  departments?: Array<{ _id: string; department_name: string }>;
}

interface Classroom {
  _id: string;
  room_name: string;
  capacity: number;
}

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

export function YearLevelTimetable({ onBack }: YearLevelTimetableProps) {
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [selectedLevelOrder, setSelectedLevelOrder] = useState<string>('');
  const [availableYearLevels, setAvailableYearLevels] = useState<YearLevel[]>([]);
  const [selectedYearLevelId, setSelectedYearLevelId] = useState<string>('');
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [draggedSubject, setDraggedSubject] = useState<Subject | null>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');
  
  // Modal state for teacher/classroom selection
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [pendingSubject, setPendingSubject] = useState<Subject | null>(null);
  const [pendingPeriodName, setPendingPeriodName] = useState<string>('');
  const [pendingDay, setPendingDay] = useState<number>(0);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    loadYearLevels();
    loadSubjects();
    loadTerms();
    loadDepartments();
    loadTeachers();
    loadClassrooms();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await apiService.getSubjects();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setSubjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const loadTerms = async () => {
    try {
      const response = await apiService.getTerms();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setTerms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading terms:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await apiService.getTeachers();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setTeachers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading teachers:', err);
    }
  };

  const loadClassrooms = async () => {
    try {
      const response = await apiService.getClassrooms();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setClassrooms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading classrooms:', err);
    }
  };

  useEffect(() => {
    if (selectedLevelOrder) {
      const filtered = yearLevels.filter(yl => yl.level_order.toString() === selectedLevelOrder);
      setAvailableYearLevels(filtered);
      setSelectedYearLevelId(''); // Reset selection when level order changes
      setTimetable(null);
    }
  }, [selectedLevelOrder, yearLevels]);

  const loadYearLevels = async () => {
    try {
      const response = await apiService.getYearLevels();
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setYearLevels(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading year levels:', err);
    }
  };

  const loadTimetable = async (yearLevelId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTimetable(yearLevelId);
      
      if (response.success) {
        const data = (response.data as any)?.message || response.data;
        setTimetable(data as TimetableData);
      } else {
        setError('Failed to load timetable');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelOrderChange = (levelOrder: string) => {
    setSelectedLevelOrder(levelOrder);
  };

  const handleYearLevelChange = (yearLevelId: string) => {
    setSelectedYearLevelId(yearLevelId);
    if (yearLevelId) {
      loadTimetable(yearLevelId);
    } else {
      setTimetable(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, subject: Subject) => {
    setDraggedSubject(subject);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedSubject(null);
  };

  const handleDrop = async (e: React.DragEvent, periodName: string, day: number) => {
    e.preventDefault();
    
    if (!draggedSubject || !timetable || !timetable.all_periods) return;
    
    if (!selectedTermId) {
      setError('Please select a term first.');
      return;
    }
    
    // Set up modal state for teacher/classroom selection
    setPendingSubject(draggedSubject);
    setPendingPeriodName(periodName);
    setPendingDay(day);
    setSelectedTeacherId('');
    setSelectedClassroomId('');
    setShowAssignmentModal(true);
    setDraggedSubject(null);
  };

  const handleAssignTeacherAndClassroom = async () => {
    if (!pendingSubject || !selectedTeacherId || !selectedClassroomId) {
      setError('Please select both a teacher and a classroom');
      return;
    }

    if (!timetable || !timetable.all_periods) {
      setError('Timetable data not available');
      return;
    }

    // Find the period in all_periods to get its ID
    const period = timetable.all_periods.find(p => p.name === pendingPeriodName);
    if (!period) {
      setError('Period not found');
      return;
    }

    try {
      // Check if a class already exists for this year level, period, and day
      const existingClass = timetable.timetable.find(
        c => c.period_name === pendingPeriodName && c.day_of_week === pendingDay
      );
      
      // Generate class name from year level order and name (not including subject)
      const selectedYearLevel = yearLevels.find(yl => yl._id === selectedYearLevelId);
      if (!selectedYearLevel) {
        setError('Year level not found');
        return;
      }
      
      const gradeNames = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
      const gradeName = gradeNames[selectedYearLevel.level_order] || `${selectedYearLevel.level_order}th`;
      const class_name = `${gradeName} ${selectedYearLevel.level_name}`;
      
      if (existingClass) {
        // Update existing class with subject, teacher, and classroom
        await apiService.updateClass(existingClass._id, {
          ...existingClass,
          subject_id: pendingSubject._id,
          teacher_id: selectedTeacherId,
          classroom_id: selectedClassroomId
        });
      } else {
        // Create new class for this slot
        await apiService.createClass({
          term_id: selectedTermId,
          year_level_id: selectedYearLevelId,
          class_name: class_name,
          subject_id: pendingSubject._id,
          teacher_id: selectedTeacherId,
          period_id: period._id,
          day_of_week: pendingDay,
          classroom_id: selectedClassroomId
        });
      }
      
      // Close modal and reload timetable
      setShowAssignmentModal(false);
      setPendingSubject(null);
      setPendingPeriodName('');
      setPendingDay(0);
      setSelectedTeacherId('');
      setSelectedClassroomId('');
      loadTimetable(selectedYearLevelId);
    } catch (err) {
      console.error('Error assigning subject:', err);
      setError('Failed to assign subject to timetable slot');
    }
  };

  const handleCancelAssignment = () => {
    setShowAssignmentModal(false);
    setPendingSubject(null);
    setPendingPeriodName('');
    setPendingDay(0);
    setSelectedTeacherId('');
    setSelectedClassroomId('');
  };


  // Organize classes into a grid by period and day of week
  const organizeTimetableGrid = (): { periods: string[]; periodMap: Map<string, { start: string; end: string }>; classes: Map<string, Class> } | null => {
    if (!timetable) return null;

    // Use all_periods from API to build the grid, or fall back to getting from classes
    const periodMap = new Map<string, { start: string; end: string }>();
    const classesByPeriodDay = new Map<string, Class>();

    // If we have all_periods from API, use that for building the grid structure
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
          
          // Add period info if not already added from all_periods
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

  if (loading && !timetable) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  const grid = organizeTimetableGrid();
  const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday

  // Filter subjects based on search and department
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subject_name.toLowerCase().includes(subjectSearchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || subject.department_id === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="admin-content" style={{ paddingLeft: 'var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button onClick={onBack} className="btn btn--secondary">
          ← Back to Classes
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h2>Year Level Timetable</h2>
        <p className="table-description">
          View the complete schedule for a year level showing all classes organized by time periods.
        </p>
      </div>

      {/* Two-step selection: First Grade, then Section */}
      <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="level_order_select" style={{ 
            display: 'block', 
            marginBottom: 'var(--space-sm)',
            fontWeight: 600 
          }}>
            Select Grade:
          </label>
          <select
            id="level_order_select"
            value={selectedLevelOrder}
            onChange={(e) => handleLevelOrderChange(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: 'var(--text-base)'
            }}
          >
            <option value="">-- Select Grade --</option>
            {[...new Set(yearLevels.map(y => y.level_order))].sort().map((order) => (
              <option key={order} value={order}>
                Grade {order}
              </option>
            ))}
          </select>
        </div>

        {selectedLevelOrder && (
          <div style={{ flex: 1 }}>
            <label htmlFor="year_level_select" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-sm)',
              fontWeight: 600 
            }}>
              Select Section:
            </label>
            <select
              id="year_level_select"
              value={selectedYearLevelId}
              onChange={(e) => handleYearLevelChange(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                fontSize: 'var(--text-base)'
              }}
            >
              <option value="">-- Select Section --</option>
              {availableYearLevels.map((yearLevel) => (
                <option key={yearLevel._id} value={yearLevel._id}>
                  {yearLevel.level_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Term selection - shown after year level is selected */}
      {selectedYearLevelId && (
        <div style={{ marginBottom: 'var(--space-lg)', maxWidth: '400px' }}>
          <label htmlFor="term_select" style={{ 
            display: 'block', 
            marginBottom: 'var(--space-sm)',
            fontWeight: 600 
          }}>
            Select Term:
          </label>
          <select
            id="term_select"
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 'var(--text-base)',
              WebkitAppearance: 'menulist',
              MozAppearance: 'menulist',
              appearance: 'menulist'
            }}
          >
            <option value="" style={{ background: 'var(--card)', color: 'var(--text)' }}>-- Select Term --</option>
            {terms.map((term) => (
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
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {/* Timetable container with subjects panel and timetable side by side */}
      {selectedYearLevelId && selectedTermId && (timetable && grid && grid.periods.length > 0) && (
        <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          {/* Subjects panel - integrated in same container */}
          <div style={{ 
            width: '220px',
            flexShrink: 0,
            padding: 'var(--space-md)',
            background: 'var(--card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ 
              marginBottom: 'var(--space-sm)',
              fontSize: '0.875rem',
              color: 'var(--primary)',
              fontWeight: 600
            }}>
              📚 Subjects
            </h3>
            
            {/* Search input */}
            <input
              type="text"
              placeholder="Search subjects..."
              value={subjectSearchQuery}
              onChange={(e) => setSubjectSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-xs)',
                marginBottom: 'var(--space-sm)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.75rem'
              }}
            />
            
            {/* Department filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-xs)',
                marginBottom: 'var(--space-sm)',
                borderRadius: '0.25rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.75rem',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist',
                appearance: 'menulist'
              }}
            >
              <option value="" style={{ background: 'var(--card)', color: 'var(--text)' }}>All Departments</option>
              {departments.map((dept) => (
                <option 
                  key={dept._id} 
                  value={dept._id}
                  style={{ background: 'var(--card)', color: 'var(--text)' }}
                >
                  {dept.department_name}
                </option>
              ))}
            </select>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', overflowY: 'auto', maxHeight: 'calc(80vh - 200px)' }}>
              {filteredSubjects.map((subject) => (
                <div
                  key={subject._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, subject)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: draggedSubject?._id === subject._id ? 'var(--primary)' : 'var(--surface)',
                    color: draggedSubject?._id === subject._id ? 'white' : 'var(--text)',
                    borderRadius: '0.25rem',
                    cursor: 'grab',
                    border: '1px solid var(--border)',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    userSelect: 'none',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {subject.subject_name}
                </div>
              ))}
            </div>
          </div>

          {/* Timetable grid */}
          <div style={{ flex: 1, overflowX: 'auto' }}>
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
                <th style={{ padding: 'var(--space-md)', textAlign: 'center', minWidth: '100px', maxWidth: '100px' }}>Monday</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center', minWidth: '100px', maxWidth: '100px' }}>Tuesday</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center', minWidth: '100px', maxWidth: '100px' }}>Wednesday</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center', minWidth: '100px', maxWidth: '100px' }}>Thursday</th>
                <th style={{ padding: 'var(--space-md)', textAlign: 'center', minWidth: '100px', maxWidth: '100px' }}>Friday</th>
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
                      whiteSpace: 'nowrap'
                    }}>
                      {timeRange || '—'}
                    </td>
                      {daysOfWeek.map(day => {
                      const classItem = grid.classes.get(`${periodName}_${day}`);
                      return (
                        <td 
                          key={day} 
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.background = 'rgba(74, 144, 226, 0.1)';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.background = '';
                          }}
                          onDrop={(e) => {
                            e.currentTarget.style.background = '';
                            handleDrop(e, periodName, day);
                          }}
                          style={{ 
                            padding: 'var(--space-sm)', 
                            textAlign: 'center',
                            verticalAlign: 'top',
                            minHeight: '60px',
                            cursor: 'pointer',
                            maxWidth: '100px'
                          }}
                        >
                          {classItem ? (
                            <div style={{
                              padding: 'var(--space-xs)',
                              background: 'var(--surface)',
                              borderRadius: '0.25rem',
                              border: '1px solid var(--primary)',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {classItem.subject_name || classItem.class_name}
                              </div>
                              {classItem.teacher_name && (
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {classItem.teacher_name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
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

      {/* Show message if timetable is loaded but no periods exist */}
      {timetable && (!grid || grid.periods.length === 0) && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-xl)',
          background: 'var(--surface)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)'
        }}>
          <p>No periods have been defined yet. Please create periods first.</p>
        </div>
      )}

      {/* Modal for teacher and classroom selection */}
      {showAssignmentModal && pendingSubject && (
        <div className="modal">
          <div className="modal__overlay" onClick={handleCancelAssignment}></div>
          <div className="modal__dialog" style={{ maxWidth: '500px' }}>
            <div className="modal__header">
              <h3>Assign Teacher and Classroom</h3>
              <button 
                className="modal__close"
                onClick={handleCancelAssignment}
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 'var(--space-xs)',
                  fontWeight: 600 
                }}>
                  Subject:
                </label>
                <input
                  type="text"
                  value={pendingSubject.subject_name}
                  disabled
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    borderRadius: '0.25rem',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--text-base)'
                  }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label htmlFor="modal_teacher" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--space-xs)',
                  fontWeight: 600 
                }}>
                  Teacher: *
                </label>
                <select
                  id="modal_teacher"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
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
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers
                    .filter(teacher => 
                      teacher.departments?.some(dept => dept._id === pendingSubject.department_id)
                    )
                    .map((teacher) => (
                      <option 
                        key={teacher._id} 
                        value={teacher._id}
                        style={{ background: 'var(--card)', color: 'var(--text)' }}
                      >
                        {teacher.given_name} {teacher.surname}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label htmlFor="modal_classroom" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--space-xs)',
                  fontWeight: 600 
                }}>
                  Classroom: *
                </label>
                <select
                  id="modal_classroom"
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
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
                  required
                >
                  <option value="">-- Select Classroom --</option>
                  {classrooms.map((classroom) => (
                    <option 
                      key={classroom._id} 
                      value={classroom._id}
                      style={{ background: 'var(--card)', color: 'var(--text)' }}
                    >
                      {classroom.room_name} (Capacity: {classroom.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn--secondary"
                  onClick={handleCancelAssignment}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn--primary"
                  onClick={handleAssignTeacherAndClassroom}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
