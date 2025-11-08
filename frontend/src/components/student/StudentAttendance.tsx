import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useUser } from '../../contexts/AuthContext';

interface AttendanceRecord {
  _id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  class_name: string;
  date: string;
  status: string;
  notes: string | null;
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

interface ClassItem {
  class_id: string;
  class_name: string;
}

const StudentAttendance: React.FC = () => {
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');

  useEffect(() => {
    console.log('[StudentAttendance] User:', user);
    if (user) {
      console.log('[StudentAttendance] Loading filter options...');
      loadFilterOptions();
      if (isAdmin) {
        loadClasses();
      }
    }
  }, [user]);

  // Load attendance data when filters are selected
  useEffect(() => {
    // For admin: require class filter too
    // For student: only need year, term, subject
    const hasRequiredFilters = isAdmin 
      ? (filterYear && filterTerm && filterSubject && filterClass)
      : (filterYear && filterTerm && filterSubject);
    
    if (user && hasRequiredFilters) {
      console.log('[StudentAttendance] Filters selected, loading attendance...');
      loadAttendanceData();
    } else {
      setFilteredRecords([]);
    }
  }, [user, filterYear, filterTerm, filterSubject, filterClass]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      
      // Load school years
      const yearsResp = await apiService.getSchoolYears();
      if (yearsResp.success && yearsResp.data) {
        const years = (yearsResp.data as any)?.message || [];
        setSchoolYears(Array.isArray(years) ? years : []);
      }

      // Load terms
      const termsResp = await apiService.getTerms();
      if (termsResp.success && termsResp.data) {
        const termsList = (termsResp.data as any)?.message || [];
        setTerms(Array.isArray(termsList) ? termsList : []);
      }

      // Load subjects
      const subjectsResp = await apiService.getSubjects();
      if (subjectsResp.success && subjectsResp.data) {
        const subs = (subjectsResp.data as any)?.message || [];
        setSubjects(Array.isArray(subs) ? subs : []);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false); // Set loading to false after filter options load
    }
  };

  const loadClasses = async () => {
    try {
      const response = await apiService.getClasses();
      if (response.success && response.data) {
        const allClasses = (response.data as any)?.message || [];
        // Extract unique class names
        const uniqueClasses = Array.from(
          new Map(allClasses.map((c: any) => [c.class_name, { class_id: c._id, class_name: c.class_name }])).values()
        );
        setClasses(uniqueClasses as ClassItem[]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        // Admin: Load ALL attendance for selected class
        console.log('[StudentAttendance] Admin loading attendance for class:', filterClass);
        
        const filters: any = {
          year_id: filterYear,
          term_id: filterTerm,
          subject_id: filterSubject
        };
        
        if (filterClass) {
          // Find the class_id from class_name
          const selectedClass = classes.find(c => c.class_name === filterClass);
          if (selectedClass) {
            filters.class_id = selectedClass.class_id;
          }
        }
        
        const response = await apiService.getAttendance(filters);
        console.log('[StudentAttendance] Admin response:', response);
        
        if (response.success && response.data) {
          const records = (response.data as any)?.attendance_records || [];
          console.log('[StudentAttendance] Admin loaded:', records.length, 'records');
          setFilteredRecords(records);
        }
      } else {
        // Student: Load only my attendance
        console.log('[StudentAttendance] Student loading attendance');
        
        let studentId = user?.id;
        
        // If user.id doesn't exist, try to get student by username
        if (!studentId && user) {
          console.log('[StudentAttendance] No user.id, trying to get student by username...');
          const studentResp = await apiService.getStudents();
          if (studentResp.success && studentResp.data) {
            const students = (studentResp.data as any)?.message || [];
            const currentStudent = students.find((s: any) => s.username === user.email || s.email_address === user.email);
            if (currentStudent) {
              studentId = currentStudent._id;
              console.log('[StudentAttendance] Found student ID:', studentId);
            }
          }
        }
        
        if (!studentId) {
          console.error('[StudentAttendance] Could not determine student ID');
          return;
        }
        
        const response = await apiService.getAttendance({ 
          student_id: studentId,
          year_id: filterYear,
          term_id: filterTerm,
          subject_id: filterSubject
        });
        console.log('[StudentAttendance] Student response:', response);
        
        if (response.success && response.data) {
          const records = (response.data as any)?.attendance_records || [];
          console.log('[StudentAttendance] Student loaded:', records);
          setFilteredRecords(records);
        } else {
          console.error('[StudentAttendance] Failed to load:', response.error);
        }
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      present: { background: '#28a745', icon: '✓' },
      absent: { background: '#dc3545', icon: '✗' },
      late: { background: '#ffc107', icon: '⏰' },
      excused: { background: '#17a2b8', icon: '📝' }
    };
    
    const config = styles[status] || { background: '#6c757d', icon: '?' };
    
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        background: config.background,
        color: 'white',
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: filteredRecords.length
    };
    
    filteredRecords.forEach(record => {
      if (record.status in stats) {
        stats[record.status as keyof typeof stats]++;
      }
    });
    
    const attendanceRate = stats.total > 0
      ? ((stats.present + stats.late + stats.excused) / stats.total * 100).toFixed(1)
      : '0';
    
    return { ...stats, attendanceRate };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && (!schoolYears.length && !terms.length && !subjects.length)) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
      Loading filter options...
    </div>;
  }

  const stats = getAttendanceStats();

  return (
    <div className="student-attendance">
      <h2>My Attendance</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        View your attendance record across all classes
      </p>

      {/* Cascading Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            School Year:
          </label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterTerm('');
              setFilteredRecords([]); // Clear results immediately
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '150px'
            }}
          >
            <option value="">All Years</option>
            {schoolYears.map(year => (
              <option key={year._id} value={year._id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Term:
          </label>
          <select
            value={filterTerm}
            onChange={(e) => {
              setFilterTerm(e.target.value);
              setFilteredRecords([]); // Clear results immediately
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '150px',
              opacity: !filterYear ? 0.5 : 1,
              cursor: !filterYear ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">All Terms</option>
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Subject:
          </label>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilteredRecords([]); // Clear results immediately
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              minWidth: '200px'
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
              Class:
            </label>
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setFilteredRecords([]); // Clear results immediately
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                minWidth: '150px'
              }}
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.class_id} value={cls.class_name}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Show message if filters not selected */}
      {isAdmin ? (
        (!filterYear || !filterTerm || !filterSubject || !filterClass) && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--card)',
            borderRadius: '8px',
            color: 'var(--muted)',
            marginBottom: '2rem'
          }}>
            Please select School Year, Term, Subject, and Class to view attendance
          </div>
        )
      ) : (
        (!filterYear || !filterTerm || !filterSubject) && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--card)',
            borderRadius: '8px',
            color: 'var(--muted)',
            marginBottom: '2rem'
          }}>
            Please select School Year, Term, and Subject to view attendance
          </div>
        )
      )}

      {/* Attendance Summary */}
      {(isAdmin ? (filterYear && filterTerm && filterSubject && filterClass) : (filterYear && filterTerm && filterSubject)) && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
        <div style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #28a745' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#28a745' }}>{stats.present}</div>
          <div style={{ color: 'var(--muted)' }}>Present</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #dc3545' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#dc3545' }}>{stats.absent}</div>
          <div style={{ color: 'var(--muted)' }}>Absent</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #ffc107' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffc107' }}>{stats.late}</div>
          <div style={{ color: 'var(--muted)' }}>Late</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid #17a2b8' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#17a2b8' }}>{stats.excused}</div>
          <div style={{ color: 'var(--muted)' }}>Excused</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '8px', border: '2px solid var(--border)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)' }}>{stats.attendanceRate}%</div>
          <div style={{ color: 'var(--muted)' }}>Attendance Rate</div>
        </div>
        </div>
      )}

      {/* Attendance Records Table */}
      {filterYear && filterTerm && filterSubject && (
        <div>
        <h3 style={{ marginBottom: '1rem' }}>Attendance History</h3>
        
        {filteredRecords.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            background: 'var(--card)',
            borderRadius: '8px',
            color: 'var(--muted)'
          }}>
            No attendance records found
          </div>
        ) : (
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
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                  {isAdmin && <th style={{ padding: '1rem', textAlign: 'left' }}>Student</th>}
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Class</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text)' }}>
                      {formatDate(record.date)}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>
                        {record.student_name || 'Unknown'}
                      </td>
                    )}
                    <td style={{ padding: '1rem', color: 'var(--text)' }}>
                      {record.class_name || '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {getStatusBadge(record.status)}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;

