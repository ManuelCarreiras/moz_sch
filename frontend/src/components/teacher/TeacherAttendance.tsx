import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface TeacherClass {
  _id: string;
  class_name: string;
  subject_name: string;
  subject_id: string;
  term_number: number;
  term_id: string;
  year_name: string;
  year_id: string;
}

interface SchoolYear {
  _id: string;
  year_name: string;
}

interface Term {
  _id: string;
  term_number: number;
  year_id: string;
}

interface Subject {
  _id: string;
  subject_name: string;
}

interface StudentRoster {
  student_id: string;
  student_name: string;
  status: string;
  notes: string | null;
  attendance_id: string | null;
}

interface RosterData {
  class_id: string;
  class_name: string;
  date: string;
  roster: StudentRoster[];
  student_count: number;
}

const TeacherAttendance: React.FC = () => {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localRoster, setLocalRoster] = useState<StudentRoster[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      loadRoster();
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    if (roster) {
      setLocalRoster(roster.roster);
    }
  }, [roster]);

  const loadClasses = async () => {
    try {
      const response = await apiService.getTeacherSchedule();
      if (response.success && response.data) {
        const messageData = (response.data as any)?.message || response.data;
        const classList = messageData?.timetable || [];
        setClasses(classList);
        
        // Use pre-built filter data from API
        const availableYears = messageData?.available_years || [];
        const availableTerms = messageData?.available_terms || [];
        
        // Extract unique subjects from classes
        const uniqueSubjects = Array.from(new Set(classList.map((c: TeacherClass) => c.subject_id)))
          .map((id: any) => {
            const cls = classList.find((c: TeacherClass) => c.subject_id === id);
            return { _id: id as string, subject_name: cls?.subject_name || '' };
          })
          .filter((s: any) => s._id);
        
        setSchoolYears(availableYears);
        setTerms(availableTerms);
        setSubjects(uniqueSubjects as Subject[]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadRoster = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAttendanceRoster(selectedClassId, selectedDate);
      
      if (response.success && response.data) {
        setRoster(response.data as RosterData);
      } else {
        console.error('Error loading roster:', response.error);
      }
    } catch (error) {
      console.error('Error loading roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setLocalRoster(prev => 
      prev.map(student => 
        student.student_id === studentId 
          ? { ...student, status: newStatus }
          : student
      )
    );
  };

  const handleNotesChange = (studentId: string, newNotes: string) => {
    setLocalRoster(prev => 
      prev.map(student => 
        student.student_id === studentId 
          ? { ...student, notes: newNotes }
          : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;

    setSaving(true);
    try {
      const attendanceData = {
        class_id: selectedClassId,
        date: selectedDate,
        attendance: localRoster.map(student => ({
          student_id: student.student_id,
          status: student.status,
          notes: student.notes || undefined
        }))
      };

      const response = await apiService.saveAttendance(attendanceData);
      
      if (response.success) {
        alert('Attendance saved successfully!');
        await loadRoster(); // Reload to get saved data
      } else {
        alert('Error saving attendance: ' + (response.message || response.error));
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status: string) => {
    setLocalRoster(prev => 
      prev.map(student => ({ ...student, status }))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#28a745';
      case 'late': return '#ffc107';
      case 'excused': return '#17a2b8';
      case 'absent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusCount = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };
    
    localRoster.forEach(student => {
      if (student.status in counts) {
        counts[student.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCount();
  const attendanceRate = localRoster.length > 0 
    ? ((statusCounts.present + statusCounts.late + statusCounts.excused) / localRoster.length * 100).toFixed(1)
    : '0';

  return (
    <div className="teacher-attendance">
      <h2>Attendance</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Take and manage student attendance for your classes
      </p>

      {/* Cascading Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* School Year */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
            School Year:
          </label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterTerm('');
              setSelectedClassId('');
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">-- Select Year --</option>
            {schoolYears.map(year => (
              <option key={year._id} value={year._id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        {/* Term */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
            Term:
          </label>
          <select
            value={filterTerm}
            onChange={(e) => {
              setFilterTerm(e.target.value);
              setSelectedClassId('');
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '1rem',
              minWidth: '150px',
              opacity: !filterYear ? 0.5 : 1,
              cursor: !filterYear ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">-- Select Term --</option>
            {(() => {
              const filteredTerms = filterYear 
                ? terms.filter(t => t.year_id === filterYear)
                : [];
              return filteredTerms.map(term => (
                <option key={term._id} value={term._id}>
                  Term {term.term_number}
                </option>
              ));
            })()}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
            Subject:
          </label>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setSelectedClassId('');
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
            Class:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="">-- Select Class --</option>
            {(() => {
              // Filter classes by all selections
              const filteredClasses = classes.filter(cls => {
                if (filterYear && cls.year_id !== filterYear) return false;
                if (filterTerm && cls.term_id !== filterTerm) return false;
                if (filterSubject && cls.subject_id !== filterSubject) return false;
                return true;
              });
              
              // De-duplicate by class_name only
              const uniqueClassesMap = new Map<string, TeacherClass>();
              filteredClasses.forEach(cls => {
                if (!uniqueClassesMap.has(cls.class_name)) {
                  uniqueClassesMap.set(cls.class_name, cls);
                }
              });
              const uniqueClasses = Array.from(uniqueClassesMap.values());
              
              return uniqueClasses.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.class_name}
                </option>
              ));
            })()}
          </select>
        </div>

        {/* Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
            Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '1rem',
              minWidth: '200px'
            }}
          />
        </div>
      </div>

      {/* Attendance Summary */}
      {roster && roster.student_count > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ padding: '1rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #28a745' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#28a745' }}>{statusCounts.present}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Present</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #dc3545' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#dc3545' }}>{statusCounts.absent}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Absent</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #ffc107' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffc107' }}>{statusCounts.late}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Late</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #17a2b8' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#17a2b8' }}>{statusCounts.excused}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Excused</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{attendanceRate}%</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Attendance Rate</div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {roster && roster.student_count > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleMarkAll('present')}
            style={{
              padding: '0.5rem 1rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Mark All Absent
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginLeft: 'auto'
            }}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}

      {/* Roster Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          Loading roster...
        </div>
      ) : !selectedClassId ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'var(--card)', 
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          Please select a class to take attendance
        </div>
      ) : roster && roster.student_count > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: 'var(--card)', 
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', minWidth: '250px' }}>Student</th>
                <th style={{ padding: '1rem', textAlign: 'center', minWidth: '180px' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', minWidth: '300px' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {localRoster.map((student, index) => (
                <tr key={student.student_id} style={{ 
                  borderBottom: '1px solid var(--border)',
                  background: index % 2 === 0 ? 'var(--card)' : 'var(--background)'
                }}>
                  <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text)' }}>
                    {student.student_name}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <select
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.student_id, e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        border: '2px solid ' + getStatusColor(student.status),
                        background: getStatusColor(student.status),
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        minWidth: '140px'
                      }}
                    >
                      <option value="present" style={{ background: '#28a745', color: 'white' }}>✓ Present</option>
                      <option value="absent" style={{ background: '#dc3545', color: 'white' }}>✗ Absent</option>
                      <option value="late" style={{ background: '#ffc107', color: 'white' }}>⏰ Late</option>
                      <option value="excused" style={{ background: '#17a2b8', color: 'white' }}>📝 Excused</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="text"
                      value={student.notes || ''}
                      onChange={(e) => handleNotesChange(student.student_id, e.target.value)}
                      placeholder="Add notes..."
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--text)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : roster && roster.student_count === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'var(--card)', 
          borderRadius: '8px',
          color: 'var(--muted)'
        }}>
          No students enrolled in this class
        </div>
      ) : null}

      {/* Legend */}
      {roster && roster.student_count > 0 && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--card)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <strong style={{ color: 'var(--text)' }}>Status Legend:</strong>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#28a745' }}>✓ Present</span>
            <span style={{ color: '#dc3545' }}>✗ Absent</span>
            <span style={{ color: '#ffc107' }}>⏰ Late</span>
            <span style={{ color: '#17a2b8' }}>📝 Excused</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;

