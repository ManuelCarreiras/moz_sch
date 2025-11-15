import { useState, useEffect } from 'react';
import { useAuth, useUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSrc from '../assets/Santa_Isabel.png';
import { TeacherWizard } from './admin/TeacherWizard';
import { TeacherSchedule } from './TeacherSchedule';
import AssignmentList from './teacher/AssignmentList';
import Gradebook from './teacher/Gradebook';
import TeacherAttendance from './teacher/TeacherAttendance';
import TeacherStudents from './teacher/TeacherStudents';
import TeacherOverview from './teacher/TeacherOverview';
import TeacherResources from './teacher/TeacherResources';
import { TeachersTable } from './admin/TeachersTable';
import apiService from '../services/apiService';

type TeacherTab = 'overview' | 'classes' | 'students' | 'grades' | 'resources' | 'attendance' | 'assignments' | 'teachers';

interface TeacherClass {
  _id: string;
  class_name: string;
  subject_name: string;
  subject_id: string;
  term_number: number;
  term_id: string;
  year_name: string;
  year_id: string;
  period_name?: string;
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

export function TeacherDashboard() {
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<TeacherTab>(isAdmin ? 'classes' : 'overview');
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Filter states for Gradebook
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  // Load teacher's classes when dashboard loads OR when Grades tab is opened
  useEffect(() => {
    console.log('[TeacherDashboard] User object:', user);
    console.log('[TeacherDashboard] User ID:', user?.id);
    console.log('[TeacherDashboard] User email:', user?.email);
    
    // Always try to load classes if user exists (regardless of user.id)
    if (user) {
      console.log('[TeacherDashboard] Loading teacher classes...');
      loadTeacherClasses();
    } else {
      console.log('[TeacherDashboard] No user found, skipping class load');
    }
  }, [user]);


  // Redirect admin away from assignments and attendance tabs
  useEffect(() => {
    if (isAdmin && (activeTab === 'assignments' || activeTab === 'attendance')) {
      setActiveTab('classes');
    }
  }, [isAdmin, activeTab]);

  // Reload data when Grades tab becomes active
  useEffect(() => {
    if (activeTab === 'grades' && user) {
      console.log('[TeacherDashboard] Grades tab activated, reloading data...');
      loadTeacherClasses();
    }
  }, [activeTab]);

  const loadTeacherClasses = async () => {
    try {
      console.log('[TeacherDashboard] Calling getTeacherSchedule...');
      const response = await apiService.getTeacherSchedule();
      console.log('[TeacherDashboard] API Response:', response);
      
      if (response.success && response.data) {
        // API returns data in response.data.message
        const messageData = (response.data as any)?.message || response.data;
        const classes = messageData?.timetable || messageData?.classes || [];
        console.log('[TeacherDashboard] Parsed classes:', classes);
        setTeacherClasses(Array.isArray(classes) ? classes : []);
        
        // Use pre-built filter data from API response
        const availableYears = messageData?.available_years || [];
        const availableTerms = messageData?.available_terms || [];
        
        // Extract unique subjects from classes
        const uniqueSubjects = Array.from(new Set(classes.map((c: TeacherClass) => c.subject_id)))
          .map(id => {
            const cls = classes.find((c: TeacherClass) => c.subject_id === id);
            return { _id: id as string, subject_name: cls?.subject_name || '' };
          })
          .filter(s => s._id);
        
        console.log('[TeacherDashboard] Setting filters - Years:', availableYears);
        console.log('[TeacherDashboard] Setting filters - Terms:', availableTerms);
        console.log('[TeacherDashboard] Setting filters - Subjects:', uniqueSubjects);
        
        setSchoolYears(availableYears);
        setTerms(availableTerms);
        setSubjects(uniqueSubjects as Subject[]);
      } else {
        console.error('[TeacherDashboard] API call failed:', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[TeacherDashboard] Error loading teacher classes:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleTeacherCreated = () => {
    // Refresh teacher list or show success message
    console.log('Teacher created successfully');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        Please sign in to access the portal
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TeacherTab, label: 'Overview', icon: '🏠' },
    { id: 'classes' as TeacherTab, label: 'My Classes', icon: '📚' },
    { id: 'students' as TeacherTab, label: 'Students', icon: '👥' },
    { id: 'grades' as TeacherTab, label: 'Grades', icon: '📊' },
    { id: 'resources' as TeacherTab, label: 'Resources', icon: '📖' },
    ...(isAdmin ? [
      { id: 'teachers' as TeacherTab, label: 'Teachers', icon: '👨‍🏫' }
    ] : [
      { id: 'attendance' as TeacherTab, label: 'Attendance', icon: '✅' },
      { id: 'assignments' as TeacherTab, label: 'Assignments', icon: '📝' }
    ]),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverview isAdmin={isAdmin} />;
      case 'classes':
        return <TeacherSchedule />;
      case 'students':
        return <TeacherStudents />;
      case 'grades':
        console.log('[Gradebook] === RENDER START ===');
        console.log('[Gradebook] Filter State:', { filterYear, filterTerm, filterSubject, selectedClassId });
        console.log('[Gradebook] All Terms State:', terms);
        console.log('[Gradebook] Terms length:', terms?.length);
        console.log('[Gradebook] Terms sample:', terms?.[0]);
        
        // Get filtered terms based on selected year
        const filteredTerms = filterYear 
          ? terms.filter(t => {
              console.log('[Gradebook] Checking term:', t, 'against year:', filterYear);
              return t.year_id === filterYear;
            })
          : [];
        
        console.log('[Gradebook] Filtered Terms:', filteredTerms);
        console.log('[Gradebook] Filtered Terms length:', filteredTerms.length);
        
        // Get filtered classes based on all filter selections
        const filteredClasses = teacherClasses.filter(cls => {
          if (filterYear && cls.year_id !== filterYear) return false;
          if (filterTerm && cls.term_id !== filterTerm) return false;
          if (filterSubject && cls.subject_id !== filterSubject) return false;
          return true;
        });
        
        console.log('[Gradebook] Filtered Classes:', filteredClasses);
        
        // De-duplicate by class_name only (ignore period/subject/term duplicates)
        const uniqueClassesMap = new Map<string, TeacherClass>();
        filteredClasses.forEach(cls => {
          const key = cls.class_name;
          // If we don't have this class yet, or if this one is preferred, use it
          if (!uniqueClassesMap.has(key)) {
            uniqueClassesMap.set(key, cls);
          }
        });
        const uniqueClasses = Array.from(uniqueClassesMap.values());
        
        console.log('[Gradebook] Filtered Classes (all):', filteredClasses);
        console.log('[Gradebook] Unique Classes:', uniqueClasses);
        
        return (
          <div className="teacher-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Gradebook</h2>
              <p>Enter and manage student grades for assignments.</p>
              
              {/* Cascading Filters */}
              <div style={{ 
                marginTop: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {/* School Year Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9rem'
                  }}>
                    School Year:
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => {
                      setFilterYear(e.target.value);
                      setFilterTerm(''); // Reset dependent filters
                      setSelectedClassId('');
                    }}
                    style={{
                      padding: '0.5rem',
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

                {/* Term Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9rem'
                  }}>
                    Term:
                  </label>
                  <select
                    value={filterTerm}
                    onChange={(e) => {
                      console.log('[Gradebook] Term selected:', e.target.value);
                      if (!filterYear) {
                        console.log('[Gradebook] No year selected, ignoring term change');
                        return;
                      }
                      setFilterTerm(e.target.value);
                      setSelectedClassId('');
                    }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--text)',
                      fontSize: '1rem',
                      minWidth: '150px',
                      opacity: (!filterYear || filteredTerms.length === 0) ? 0.5 : 1,
                      cursor: (!filterYear || filteredTerms.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">-- Select Term --</option>
                    {(() => {
                      console.log('[Gradebook] About to map filteredTerms, length:', filteredTerms?.length);
                      if (filteredTerms && filteredTerms.length > 0) {
                        return filteredTerms.map(term => {
                          console.log('[Gradebook] Rendering term option:', term);
                          return (
                            <option 
                              key={term._id} 
                              value={term._id}
                              style={{ 
                                background: 'var(--card)', 
                                color: 'var(--text)',
                                display: 'block'
                              }}
                            >
                              Term {term.term_number}
                            </option>
                          );
                        });
                      } else {
                        console.log('[Gradebook] NO TERMS TO RENDER!');
                        return <option disabled>No terms available</option>;
                      }
                    })()}
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9rem'
                  }}>
                    Subject:
                  </label>
                  <select
                    value={filterSubject}
                    onChange={(e) => {
                      setFilterSubject(e.target.value);
                      setSelectedClassId('');
                    }}
                    style={{
                      padding: '0.5rem',
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

                {/* Class Name Filter */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontSize: '0.9rem'
                  }}>
                    Class:
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--text)',
                      fontSize: '1rem',
                      minWidth: '200px'
                    }}
                  >
                    <option value="">-- Select Class --</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gradebook */}
            {selectedClassId ? (
              <Gradebook classId={selectedClassId} />
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: 'var(--card)',
                borderRadius: '8px',
                color: 'var(--muted)'
              }}>
                {!filterYear ? 'Please select a school year to begin' :
                 !filterTerm ? 'Please select a term' :
                 !filterSubject ? 'Please select a subject' :
                 'Please select a class to view the gradebook'}
              </div>
            )}
          </div>
        );
      case 'resources':
        return <TeacherResources />;
      case 'teachers':
        if (isAdmin) {
          return <TeachersTable />;
        }
        return null;
      case 'attendance':
        return <TeacherAttendance />;
      case 'assignments':
        return <AssignmentList />;
      default:
        return (
          <div className="teacher-content">
            <h2>Teacher Portal</h2>
            <p>Manage your classes, students, and teaching resources.</p>
            <div className="welcome-message">
              <p>Welcome to your teacher portal! Use the sidebar to navigate to different sections.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <header className="teacher-header">
        <div className="teacher-header__brand">
          <img 
            className="teacher-header__logo" 
            src={logoSrc} 
            alt="Santa Isabel Escola" 
            loading="eager" 
          />
          <div className="teacher-header__title">
            <h1>Teacher Portal</h1>
            <span className="teacher-header__subtitle">Santa Isabel Escola</span>
          </div>
        </div>
        <div className="teacher-header__user">
          <span className="teacher-header__user-info">
            Teacher: {user.email}
          </span>
          <button className="btn btn--small" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn btn--small" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="teacher-dashboard__content">
        {/* Sidebar */}
        <aside className="teacher-sidebar">
          <nav className="teacher-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`teacher-nav__item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="teacher-nav__icon">{tab.icon}</span>
                <span className="teacher-nav__label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="teacher-main">
          {renderTabContent()}
        </main>
      </div>

      {/* Create Teacher Modal */}
      {showCreateTeacher && (
        <TeacherWizard 
          onClose={() => setShowCreateTeacher(false)}
          onSuccess={handleTeacherCreated}
        />
      )}
    </div>
  );
}
