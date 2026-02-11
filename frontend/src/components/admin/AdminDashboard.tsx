import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useUser } from '../../contexts/AuthContext';
import { ClassesTable } from './ClassesTable';
import { DepartmentTable } from './DepartmentTable';
import { SubjectTable } from './SubjectTable';
import { ClassroomManagement } from './ClassroomManagement';
import { SimpleGuardianWizard } from './SimpleGuardianWizard';
import { StudentGuardianAssignment } from './StudentGuardianAssignment';
import { TeacherDepartmentAssignment } from './TeacherDepartmentAssignment';
import { SchoolYearManagement } from './SchoolYearManagement';
import AcademicFoundationManagement from './AcademicFoundationManagement';
import { StudentClassEnrollment } from './StudentClassEnrollment';
import { YearLevelTimetable } from './YearLevelTimetable';
import GradingCriteriaTable from './GradingCriteriaTable';
import { FinancialManagement } from './FinancialManagement';
import AssessmentTypeTable from './AssessmentTypeTable';
import { StaffTable } from './StaffTable';
import { ThemeSelector } from '../ThemeSelector';
import { LanguageSelector } from '../LanguageSelector';
import apiService from '../../services/apiService';
import logoSrc from '../../assets/Santa_Isabel.png';

type AdminTab = 'overview' | 'students' | 'teachers' | 'guardians' | 'academic-setup' | 'academic-foundation' | 'classes' | 'financial' | 'staff';
type AcademicSetupTab = 'overview' | 'departments' | 'subjects' | 'classrooms' | 'teacher-departments' | 'school-year-management' | 'grading-criteria' | 'assessment-types';
type GuardianManagementTab = 'overview' | 'guardian-creation' | 'student-assignment';
type ClassManagementTab = 'classes' | 'enrollments' | 'timetable';

export function AdminDashboard() {
  const { t } = useTranslation();
  const { signOut, isLoading } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAcademicTab, setActiveAcademicTab] = useState<AcademicSetupTab>('overview');
  const [activeGuardianTab, setActiveGuardianTab] = useState<GuardianManagementTab>('overview');
  const [activeClassTab, setActiveClassTab] = useState<ClassManagementTab>('classes');
  
  // Overview dropdowns state
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Set initial tab based on user role - financial users should see Financial Management by default
  useEffect(() => {
    if (user?.role === 'financial' && activeTab === 'overview') {
      setActiveTab('financial');
    }
  }, [user, activeTab]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Handle navigation when tab changes
  useEffect(() => {
    if (activeTab === 'students') {
      navigate('/student', { replace: true });
    } else if (activeTab === 'teachers') {
      navigate('/teacher', { replace: true });
    }
    // Guardians now handled within Admin Dashboard (no redirect)
  }, [activeTab, navigate]);

  // Load overview data
  useEffect(() => {
    if (activeTab === 'overview') {
      loadSchoolYears();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedYearId) {
      loadClasses();
    } else {
      setClasses([]);
      setSelectedClassId('');
    }
  }, [selectedYearId]);

  useEffect(() => {
    if (selectedClassId && selectedYearId) {
      loadStudentsInClass();
      loadTeachersInClass();
    } else {
      setStudents([]);
      setTeachers([]);
      setSelectedStudentId('');
      setSelectedTeacherId('');
    }
  }, [selectedClassId, selectedYearId]);

  const loadSchoolYears = async () => {
    try {
      const response = await apiService.getSchoolYears();
      if (response.success && response.data) {
        const data = (response.data as any)?.message || response.data;
        setSchoolYears(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading school years:', error);
    }
  };

  const loadClasses = async () => {
    setLoadingOverview(true);
    try {
      const response = await apiService.getClasses();
      if (response.success && response.data) {
        const allClasses = (response.data as any)?.message || response.data;
        const classesArray = Array.isArray(allClasses) ? allClasses : [];
        
        // Filter classes by year_id (already included in API response)
        let filteredClasses = classesArray;
        if (selectedYearId) {
          filteredClasses = classesArray.filter((cls: any) => {
            return cls.year_id === selectedYearId;
          });
        }
        
        // Deduplicate by class_name (same class can appear multiple times for different subjects/terms/periods)
        const uniqueClasses = new Map<string, any>();
        filteredClasses.forEach((cls: any) => {
          if (cls.class_name && !uniqueClasses.has(cls.class_name)) {
            uniqueClasses.set(cls.class_name, cls);
          }
        });
        
        setClasses(Array.from(uniqueClasses.values()));
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadStudentsInClass = async () => {
    try {
      // Get the selected class to find its class_name
      const selectedClass = classes.find((cls: any) => cls._id === selectedClassId);
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      // Get all classes with the same name (in case there are duplicates)
      const allClassesRes = await apiService.getClasses();
      if (!allClassesRes.success || !allClassesRes.data) {
        setStudents([]);
        return;
      }
      
      const allClasses = (allClassesRes.data as any)?.message || allClassesRes.data;
      const classesArray = Array.isArray(allClasses) ? allClasses : [];
      
      // Filter classes by year and class_name
      const matchingClasses = classesArray.filter((cls: any) => {
        return cls.year_id === selectedYearId && cls.class_name === selectedClass.class_name;
      });
      
      const matchingClassIds = matchingClasses.map((cls: any) => cls._id);
      
      // Get students enrolled in any of these matching classes
      const enrollmentsRes = await apiService.getStudentClasses();
      if (enrollmentsRes.success && enrollmentsRes.data) {
        const enrollments = (enrollmentsRes.data as any)?.message || enrollmentsRes.data;
        const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
        
        // Filter enrollments by matching class IDs
        const classEnrollments = enrollmentsArray.filter((enrollment: any) => 
          matchingClassIds.includes(enrollment.class_id)
        );
        
        // Get unique student IDs
        const studentIds = [...new Set(classEnrollments.map((e: any) => e.student_id))];
        
        if (studentIds.length === 0) {
          setStudents([]);
          return;
        }
        
        // Fetch all students and filter by IDs
        const allStudentsRes = await apiService.getStudents();
        if (allStudentsRes.success && allStudentsRes.data) {
          const allStudents = (allStudentsRes.data as any)?.message || allStudentsRes.data;
          const studentsArray = Array.isArray(allStudents) ? allStudents : [];
          
          // Filter to only students enrolled in any matching class
          const studentsData = studentsArray.filter((student: any) => 
            studentIds.includes(student._id)
          );
          
          setStudents(studentsData);
        }
      }
    } catch (error) {
      console.error('Error loading students in class:', error);
      setStudents([]);
    }
  };

  const loadTeachersInClass = async () => {
    try {
      // Get the selected class to find its class_name
      const selectedClass = classes.find((cls: any) => cls._id === selectedClassId);
      if (!selectedClass) {
        setTeachers([]);
        return;
      }
      
      // Get all classes with the same name to find all teachers
      const allClassesRes = await apiService.getClasses();
      if (!allClassesRes.success || !allClassesRes.data) {
        setTeachers([]);
        return;
      }
      
      const allClasses = (allClassesRes.data as any)?.message || allClassesRes.data;
      const classesArray = Array.isArray(allClasses) ? allClasses : [];
      
      // Filter classes by year and class_name
      const matchingClasses = classesArray.filter((cls: any) => {
        return cls.year_id === selectedYearId && cls.class_name === selectedClass.class_name;
      });
      
      // Get unique teacher IDs from matching classes
      const teacherIds = [...new Set(
        matchingClasses
          .map((cls: any) => cls.teacher_id)
          .filter((id: any) => id) // Remove null/undefined
      )];
      
      if (teacherIds.length === 0) {
        setTeachers([]);
        return;
      }
      
      // Fetch teacher details
      const teachersData: any[] = [];
      for (const teacherId of teacherIds) {
        const teacherRes = await apiService.getTeacher(teacherId);
        if (teacherRes.success && teacherRes.data) {
          const teacherData = (teacherRes.data as any)?.message || teacherRes.data;
          teachersData.push(teacherData);
        }
      }
      
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers in class:', error);
      setTeachers([]);
    }
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
        {t('common.loading')}
      </div>
    );
  }

  // Allow admin, financial, and secretary roles to access this dashboard
  const allowedRoles = ['admin', 'financial', 'secretary'];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: 'var(--text-lg)',
        color: 'var(--muted)'
      }}>
        {t('dashboard.accessDenied')}
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const isFinancial = user.role === 'financial';

  // Define all tabs with role-based visibility
  const allTabs = [
    { id: 'overview' as AdminTab, labelKey: 'admin.tabs.overview', icon: '🏠', roles: ['admin', 'secretary'] },
    { id: 'students' as AdminTab, labelKey: 'admin.tabs.students', icon: '👥', roles: ['admin', 'secretary'] },
    { id: 'teachers' as AdminTab, labelKey: 'admin.tabs.teachers', icon: '👨‍🏫', roles: ['admin', 'secretary'] },
    { id: 'guardians' as AdminTab, labelKey: 'admin.tabs.guardians', icon: '👨‍👩‍👧‍👦', roles: ['admin', 'secretary'] },
    { id: 'academic-setup' as AdminTab, labelKey: 'admin.tabs.academicSetup', icon: '🏗️', roles: ['admin', 'secretary'] },
    { id: 'academic-foundation' as AdminTab, labelKey: 'admin.tabs.academicFoundation', icon: '📋', roles: ['admin', 'secretary'] },
    { id: 'classes' as AdminTab, labelKey: 'admin.tabs.classes', icon: '📚', roles: ['admin', 'secretary'] },
    { id: 'financial' as AdminTab, labelKey: 'admin.tabs.financial', icon: '💰', roles: ['admin', 'financial'] },
    { id: 'staff' as AdminTab, labelKey: 'admin.tabs.staff', icon: '👔', roles: ['admin'] },
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter(tab => tab.roles.includes(user.role));

  const renderTabContent = () => {
    // Financial users should not see the overview - redirect to financial management
    if (activeTab === 'overview' && user?.role === 'financial') {
      // This should be handled by useEffect, but as a safeguard, return financial content
      return <FinancialManagement />;
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="admin-content">
            <h2>{isAdmin ? t('admin.adminOverview') : t('admin.overview')}</h2>
            <p>{isAdmin ? t('admin.welcomeAdmin') : t('admin.welcomeSecretary')}</p>
            
            <div className="admin-overview-grid">
              {/* Students Section */}
              <div style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>👥 {t('admin.overviewStudents')}</h3>
                
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>
                    {t('common.schoolYear')}
                  </label>
                  <select
                    value={selectedYearId}
                    onChange={(e) => {
                      setSelectedYearId(e.target.value);
                      setSelectedClassId('');
                      setSelectedStudentId('');
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    <option value="">{t('common.selectYear')}</option>
                    {schoolYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>
                    {t('common.class')}
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedStudentId('');
                    }}
                    disabled={!selectedYearId || loadingOverview}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: selectedYearId ? 'var(--background)' : 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: 'var(--text-base)',
                      opacity: selectedYearId ? 1 : 0.6
                    }}
                  >
                    <option value="">{t('common.selectClass')}</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>
                    {t('common.student')}
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={!selectedClassId}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: selectedClassId ? 'var(--background)' : 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: 'var(--text-base)',
                      opacity: selectedClassId ? 1 : 0.6
                    }}
                  >
                    <option value="">{t('common.selectStudent')}</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.given_name} {student.middle_name || ''} {student.surname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teachers Section */}
              <div style={{ 
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>👨‍🏫 {t('admin.overviewTeachers')}</h3>
                
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>
                    {t('common.schoolYear')}
                  </label>
                  <select
                    value={selectedYearId}
                    onChange={(e) => {
                      setSelectedYearId(e.target.value);
                      setSelectedClassId('');
                      setSelectedTeacherId('');
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    <option value="">{t('common.selectYear')}</option>
                    {schoolYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.year_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>
                    {t('common.class')}
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedTeacherId('');
                    }}
                    disabled={!selectedYearId || loadingOverview}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: selectedYearId ? 'var(--background)' : 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: 'var(--text-base)',
                      opacity: selectedYearId ? 1 : 0.6
                    }}
                  >
                    <option value="">{t('common.selectClass')}</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)' }}>
                    {t('common.teacher')}
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    disabled={!selectedClassId}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: selectedClassId ? 'var(--background)' : 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: 'var(--text-base)',
                      opacity: selectedClassId ? 1 : 0.6
                    }}
                  >
                    <option value="">{t('common.selectTeacher')}</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.given_name} {teacher.surname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'students':
        // Navigation handled by useEffect
        return (
          <div className="admin-content">
            <h2>Redirecting to Student Portal...</h2>
            <p>You will be redirected to the student portal shortly.</p>
          </div>
        );
      case 'teachers':
        // Navigation handled by useEffect
        return (
          <div className="admin-content">
            <h2>Redirecting to Teacher Portal...</h2>
            <p>You will be redirected to the teacher portal shortly.</p>
          </div>
        );
      case 'guardians':
        if (activeGuardianTab === 'guardian-creation') {
          return (
            <div className="admin-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <button 
                  className="btn btn--secondary"
                  onClick={() => setActiveGuardianTab('overview')}
                >
                  ← Back to Guardian Management
                </button>
                <div>
                  <h2>Create New Guardian</h2>
                  <p>Add a new guardian to the system.</p>
                </div>
              </div>
              <SimpleGuardianWizard 
                onClose={() => setActiveGuardianTab('overview')}
                onSuccess={() => {
                  setActiveGuardianTab('overview');
                }}
              />
            </div>
          );
        }
        
        if (activeGuardianTab === 'student-assignment') {
          return (
            <div className="admin-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <button 
                  className="btn btn--secondary"
                  onClick={() => setActiveGuardianTab('overview')}
                >
                  ← Back to Guardian Management
                </button>
                <div>
                  <h2>Assign Guardian to Student</h2>
                  <p>Link guardians with students and define their relationships.</p>
                </div>
              </div>
              <StudentGuardianAssignment 
                onClose={() => setActiveGuardianTab('overview')}
                onSuccess={() => {
                  setActiveGuardianTab('overview');
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="admin-content">
            <h2>Guardian Management</h2>
            <p>Manage guardians and their relationships with students.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3>👨‍👩‍👧‍👦 Guardian Creation</h3>
                <p>Create new guardians with personal information and contact details</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveGuardianTab('guardian-creation')}
                >
                  Create New Guardian
                </button>
              </div>

              <div className="feature-card">
                <h3>🔗 Student Assignment</h3>
                <p>Assign guardians to students and define relationship types (Parent, Grandparent, etc.)</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveGuardianTab('student-assignment')}
                >
                  Assign Guardian to Student
                </button>
              </div>

            </div>
          </div>
        );
      case 'academic-setup':
        if (activeAcademicTab === 'departments') {
          return <DepartmentTable onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'subjects') {
          return <SubjectTable onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'teacher-departments') {
          return <TeacherDepartmentAssignment onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'school-year-management') {
          return <SchoolYearManagement onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'classrooms') {
          return <ClassroomManagement onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'grading-criteria') {
          return <GradingCriteriaTable onBack={() => setActiveAcademicTab('overview')} />;
        }
        
        if (activeAcademicTab === 'assessment-types') {
          return (
            <div className="admin-content">
              <button 
                className="btn btn--secondary"
                onClick={() => setActiveAcademicTab('overview')}
                style={{ marginBottom: 'var(--space-lg)' }}
              >
                ← Back to Academic Setup
              </button>
              <AssessmentTypeTable />
            </div>
          );
        }
        
        return (
          <div className="admin-content">
            <h2>Academic Setup</h2>
            <p>Configure the foundational academic infrastructure for your school.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3>🏢 Departments</h3>
                <p>Organize subjects into departments (Mathematics, Science, Languages, Arts, etc.)</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('departments')}
                >
                  Manage Departments
                </button>
              </div>

              <div className="feature-card">
                <h3>📚 Subjects & Score Ranges</h3>
                <p>Define individual subjects, courses, and their grading scales. Create score ranges and assign them to subjects.</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('subjects')}
                >
                  Manage Subjects & Score Ranges
                </button>
              </div>

              <div className="feature-card">
                <h3>🏫 Classroom Management</h3>
                <p>Manage classroom types and physical classroom spaces with capacity planning</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('classrooms')}
                >
                  Manage Classrooms
                </button>
              </div>

              <div className="feature-card">
                <h3>👨‍🏫 Teacher Department Assignment</h3>
                <p>Assign teachers to departments for better organization and class management</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('teacher-departments')}
                >
                  Assign Teachers to Departments
                </button>
              </div>

              <div className="feature-card">
                <h3>⚖️ Grading Criteria</h3>
                <p>Define how grades are calculated for each subject and year level (Tests, Homework, Attendance)</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('grading-criteria')}
                >
                  Manage Grading Criteria
                </button>
              </div>

              <div className="feature-card">
                <h3>📝 Assessment Types</h3>
                <p>Define types of assignments and evaluations (Homework, Quiz, Test, Project, etc.)</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('assessment-types')}
                >
                  Manage Assessment Types
                </button>
              </div>

              <div className="feature-card">
                <h3>📅 School Year Management</h3>
                <p>Complete academic structure: year levels, school years, and student assignments</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => setActiveAcademicTab('school-year-management')}
                >
                  Manage School Years
                </button>
              </div>
            </div>
          </div>
        );
      case 'academic-foundation':
        return <AcademicFoundationManagement />;
      case 'classes':
        if (activeClassTab === 'enrollments') {
          return <StudentClassEnrollment onBack={() => setActiveClassTab('classes')} />;
        }
        if (activeClassTab === 'timetable') {
          return <YearLevelTimetable onBack={() => setActiveClassTab('classes')} />;
        }
        return (
          <ClassesTable 
            onNavigateToEnrollments={() => setActiveClassTab('enrollments')}
            onNavigateToTimetable={() => setActiveClassTab('timetable')}
          />
        );
      case 'financial':
        return <FinancialManagement />;
      case 'staff':
        return <StaffTable />;
      default:
        return (
          <div className="admin-content">
            <h2>{isAdmin ? t('admin.adminOverview') : t('admin.overview')}</h2>
            <p>{t('admin.welcomeShort', { role: isAdmin ? t('admin.roleAdmin') : t('admin.roleSecretary') })}</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar backdrop - mobile only */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="button"
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        aria-label="Close menu"
      />
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('common.openMenu')}
          >
            ☰
          </button>
          <img 
            className="admin-header__logo" 
            src={logoSrc} 
            alt={t('common.schoolName')} 
            loading="eager" 
          />
          <div className="admin-header__title">
            <h1>{isAdmin ? t('admin.adminPortal') : isFinancial ? t('admin.financialPortal') : t('admin.secretaryPortal')}</h1>
            <span className="admin-header__subtitle">{t('common.schoolName')}</span>
          </div>
        </div>
        <div className="admin-header__user">
          <LanguageSelector />
          <ThemeSelector />
          <span className="admin-header__user-info">
            {t('common.welcome')}, {user.email}
          </span>
          <button className="btn btn--small" onClick={handleSignOut}>
            {t('common.signOut')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-main">
        {/* Sidebar Navigation */}
        <nav className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`admin-nav__item ${activeTab === tab.id ? 'admin-nav__item--active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="admin-nav__icon">{tab.icon}</span>
                <span className="admin-nav__label">{t(tab.labelKey)}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className="admin-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
