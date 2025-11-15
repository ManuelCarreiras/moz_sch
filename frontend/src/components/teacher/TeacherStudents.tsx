import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useUser } from '../../contexts/AuthContext';

interface StudentPerformance {
  student_id: string;
  student_name: string;
  email: string;
  homework_completion_ratio: number;
  homework_completed: number;
  homework_total: number;
  attendance_ratio: number;
  attendance_present: number;
  attendance_total: number;
  test_average: number;
  test_count: number;
  test_total: number;
  subjects: string[];
  classes: string[];
}

interface SchoolYear {
  _id: string;
  year_name: string;
  start_date?: string;
  end_date?: string;
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

interface TeacherClass {
  _id: string;
  class_name: string;
  subject_id?: string;
  term_id?: string;
}

interface Teacher {
  _id: string;
  given_name: string;
  surname: string;
  email_address?: string;
}

const TeacherStudents: React.FC = () => {
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Filters
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterTeacher, setFilterTeacher] = useState<string>('');

  useEffect(() => {
    loadFilterOptions();
    if (isAdmin) {
      loadTeachers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (filterYear) {
      loadTerms();
    } else {
      setTerms([]);
      setFilterTerm('');
      setClasses([]);
      setFilterClass('');
    }
  }, [filterYear]);

  useEffect(() => {
    if (filterYear && (filterTerm || filterSubject)) {
      loadClasses();
    } else {
      setClasses([]);
      setFilterClass('');
    }
  }, [filterYear, filterTerm, filterSubject]);

  useEffect(() => {
    loadStudents();
  }, [filterYear, filterTerm, filterSubject, filterClass, filterTeacher]);

  const loadTeachers = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await apiService.getTeachers();
      if (response.success && response.data) {
        const teachersData = (response.data as any)?.message || response.data || [];
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Load school years
      const yearsResponse = await apiService.getSchoolYears();
      if (yearsResponse.success && yearsResponse.data) {
        const allYears = (yearsResponse.data as any)?.message || [];
        const yearsArray = Array.isArray(allYears) ? allYears : [];
        const now = new Date();
        const activeYears = yearsArray.filter((year: SchoolYear) => {
          if (!year.start_date || !year.end_date) return false;
          const endDate = new Date(year.end_date);
          return endDate >= now;
        });
        setSchoolYears(activeYears.length > 0 ? activeYears : yearsArray);
      }

      // Load subjects
      const subjectsResponse = await apiService.getSubjects();
      if (subjectsResponse.success && subjectsResponse.data) {
        const subs = (subjectsResponse.data as any)?.message || [];
        setSubjects(Array.isArray(subs) ? subs : []);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadTerms = async () => {
    if (!filterYear) return;
    
    try {
      const response = await apiService.getTerms();
      if (response.success && response.data) {
        const allTerms = (response.data as any)?.message || [];
        const termsArray = Array.isArray(allTerms) ? allTerms : [];
        const filteredTerms = termsArray.filter((term: Term) => term.year_id === filterYear);
        setTerms(filteredTerms);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await apiService.get('/teacher/schedule');
      if (response.success && response.data) {
        const responseData = (response.data as any)?.message || response.data;
        const classData = responseData?.timetable || [];
        
        // Filter classes based on selected filters
        let filteredClasses = classData;
        
        if (filterYear) {
          filteredClasses = filteredClasses.filter((cls: any) => cls.year_id === filterYear);
        }
        if (filterTerm) {
          filteredClasses = filteredClasses.filter((cls: any) => cls.term_id === filterTerm);
        }
        if (filterSubject) {
          filteredClasses = filteredClasses.filter((cls: any) => cls.subject_id === filterSubject);
        }
        
        // Deduplicate by class_name and get unique classes
        const uniqueClassesMap = new Map<string, TeacherClass>();
        filteredClasses.forEach((cls: any) => {
          const key = cls.class_name;
          if (!uniqueClassesMap.has(key)) {
            uniqueClassesMap.set(key, {
              _id: cls._id,
              class_name: cls.class_name,
              subject_id: cls.subject_id,
              term_id: cls.term_id
            });
          }
        });
        
        const uniqueClasses = Array.from(uniqueClassesMap.values());
        uniqueClasses.sort((a, b) => a.class_name.localeCompare(b.class_name));
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterYear) params.append('year_id', filterYear);
      if (filterTerm) params.append('term_id', filterTerm);
      if (filterSubject) params.append('subject_id', filterSubject);
      if (filterClass) {
        // Find the class name from the selected class_id
        const selectedClass = classes.find(c => c._id === filterClass);
        if (selectedClass) {
          params.append('class_name', selectedClass.class_name);
        }
      }
      if (isAdmin && filterTeacher) {
        params.append('teacher_id', filterTeacher);
      }
      
      const queryString = params.toString();
      const endpoint = queryString ? `/teacher/students?${queryString}` : '/teacher/students';
      
      const response = await apiService.get(endpoint);
      if (response.success && response.data) {
        const studentsData = (response.data as any)?.students || [];
        setStudents(studentsData);
      } else {
        console.error('Failed to load students:', response);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (ratio: number, type: 'homework' | 'attendance' | 'test') => {
    if (type === 'test') {
      if (ratio >= 16) return '#28a745'; // Green (80%+)
      if (ratio >= 12) return '#ffc107'; // Yellow (60-79%)
      return '#dc3545'; // Red (<60%)
    } else {
      if (ratio >= 80) return '#28a745'; // Green
      if (ratio >= 60) return '#ffc107'; // Yellow
      return '#dc3545'; // Red
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>;
  }

  return (
    <div className="teacher-students">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Students</h2>
        <p>Access student information and track academic progress.</p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      }}>
        {isAdmin && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
              Teacher
            </label>
            <select
              value={filterTeacher}
              onChange={(e) => {
                setFilterTeacher(e.target.value);
                setFilterYear('');
                setFilterTerm('');
                setFilterSubject('');
                setFilterClass('');
              }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.given_name} {teacher.surname}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            School Year
          </label>
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setFilterTerm('');
              setFilterSubject('');
              setFilterClass('');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Years</option>
            {schoolYears.map((year) => (
              <option key={year._id} value={year._id}>{year.year_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Term
          </label>
          <select
            value={filterTerm}
            onChange={(e) => {
              setFilterTerm(e.target.value);
              setFilterSubject('');
              setFilterClass('');
            }}
            disabled={!filterYear}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Terms</option>
            {terms.map((term) => (
              <option key={term._id} value={term._id}>Term {term.term_number}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Subject
          </label>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setFilterClass('');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.subject_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#fff' }}>
            Class
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            disabled={!filterYear || (!filterTerm && !filterSubject)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.class_name}</option>
            ))}
          </select>
        </div>

        {(filterYear || filterTerm || filterSubject || filterClass) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilterYear('');
                setFilterTerm('');
                setFilterSubject('');
                setFilterClass('');
              }}
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      {students.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px' 
        }}>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
            {loading ? 'Loading students...' : 'No students found. Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#fff', fontSize: '0.9rem' }}>
            Showing {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Homework Completion</th>
                  <th>Attendance Ratio</th>
                  <th>Test Average</th>
                  <th>Subjects</th>
                  <th>Classes</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id}>
                    <td>
                      <strong>{student.student_name}</strong>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#aaa' }}>
                      {student.email || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            borderRadius: '4px', 
                            height: '20px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              background: getStatusColor(student.homework_completion_ratio, 'homework'),
                              width: `${student.homework_completion_ratio}%`,
                              height: '100%',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <span style={{ 
                          minWidth: '80px', 
                          textAlign: 'right',
                          color: getStatusColor(student.homework_completion_ratio, 'homework'),
                          fontWeight: 600
                        }}>
                          {student.homework_completion_ratio.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                          ({student.homework_completed}/{student.homework_total})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            borderRadius: '4px', 
                            height: '20px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              background: getStatusColor(student.attendance_ratio, 'attendance'),
                              width: `${student.attendance_ratio}%`,
                              height: '100%',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <span style={{ 
                          minWidth: '80px', 
                          textAlign: 'right',
                          color: getStatusColor(student.attendance_ratio, 'attendance'),
                          fontWeight: 600
                        }}>
                          {student.attendance_ratio.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                          ({student.attendance_present}/{student.attendance_total})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          minWidth: '50px',
                          color: getStatusColor(student.test_average, 'test'),
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}>
                          {student.test_average.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                          ({student.test_count}/{student.test_total} tests)
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>
                        {student.subjects.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {student.subjects.map((subject, idx) => (
                              <span 
                                key={idx}
                                style={{
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  color: '#93c5fd',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                        {student.classes.length > 0 
                          ? student.classes.slice(0, 2).join(', ') + (student.classes.length > 2 ? '...' : '')
                          : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherStudents;

