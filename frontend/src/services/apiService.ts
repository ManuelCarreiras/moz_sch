import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const token = await authService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data || null,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Specific API methods
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Students
  async getStudents() {
    return this.get('/student');
  }

  async getStudent(id: string) {
    return this.get(`/student/${id}`);
  }

  async createStudent(studentData: any) {
    return this.post('/student', studentData);
  }

  async updateStudent(id: string, studentData: any) {
    return this.put(`/student/${id}`, studentData);
  }

  async deleteStudent(id: string) {
    return this.delete(`/student/${id}`);
  }

  async importStudentsFromExcel(file: File) {
    try {
      const url = `${this.baseURL}/student/import`;
      const token = await authService.getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data || null,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Teachers
  async getTeachers() {
    return this.get('/teacher');
  }

  async getTeacher(id: string) {
    return this.get(`/teacher/${id}`);
  }

  async createTeacher(teacherData: any) {
    return this.post('/teacher', teacherData);
  }

  async updateTeacher(id: string, teacherData: any) {
    return this.put(`/teacher/${id}`, teacherData);
  }

  async deleteTeacher(id: string) {
    return this.delete(`/teacher/${id}`);
  }

  async importTeachersFromExcel(file: File) {
    try {
      const url = `${this.baseURL}/teacher/import`;
      const token = await authService.getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data || null,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Classes
  async getClasses() {
    return this.get('/class');
  }

  async getClass(id: string) {
    return this.get(`/class/${id}`);
  }

  async createClass(classData: any) {
    return this.post('/class', classData);
  }

  async updateClass(id: string, classData: any) {
    return this.put(`/class/${id}`, classData);
  }

  async deleteClass(id: string) {
    return this.delete(`/class/${id}`);
  }

  // Student-Class Enrollments
  async getStudentClasses() {
    return this.get('/student_class');
  }

  async getStudentClass(id: string) {
    return this.get(`/student_class/${id}`);
  }

  async createStudentClass(studentClassData: any) {
    return this.post('/student_class', studentClassData);
  }

  async updateStudentClass(id: string, studentClassData: any) {
    return this.put(`/student_class/${id}`, studentClassData);
  }

  async deleteStudentClass(id: string) {
    return this.delete(`/student_class/${id}`);
  }

  // Timetable
  async getTimetable(yearLevelId: string, termId?: string, yearId?: string) {
    const params = new URLSearchParams();
    if (termId) params.append('term_id', termId);
    if (yearId) params.append('year_id', yearId);
    const queryString = params.toString();
    const url = queryString 
      ? `/class/timetable/${yearLevelId}?${queryString}`
      : `/class/timetable/${yearLevelId}`;
    return this.get(url);
  }

  async getConflicts(yearLevelId: string) {
    return this.get(`/class/conflicts/${yearLevelId}`);
  }

  // Subjects
  async getSubjects() {
    return this.get('/subject');
  }

  async getSubject(id: string) {
    return this.get(`/subject/${id}`);
  }

  async createSubject(subjectData: any) {
    return this.post('/subject', subjectData);
  }

  async updateSubject(id: string, subjectData: any) {
    return this.put(`/subject/${id}`, subjectData);
  }

  async deleteSubject(id: string) {
    return this.delete(`/subject/${id}`);
  }

  // Departments
  async getDepartments() {
    return this.get('/department');
  }

  async getDepartment(id: string) {
    return this.get(`/department/${id}`);
  }

  async createDepartment(departmentData: any) {
    return this.post('/department', departmentData);
  }

  async updateDepartment(id: string, departmentData: any) {
    return this.put(`/department/${id}`, departmentData);
  }

  async deleteDepartment(id: string) {
    return this.delete(`/department/${id}`);
  }

  // Year Levels
  async getYearLevels() {
    return this.get('/year_level');
  }

  async getYearLevel(id: string) {
    return this.get(`/year_level/${id}`);
  }

  async createYearLevel(yearLevelData: any) {
    return this.post('/year_level', yearLevelData);
  }

  async updateYearLevel(id: string, yearLevelData: any) {
    return this.put(`/year_level/${id}`, yearLevelData);
  }

  async deleteYearLevel(id: string) {
    return this.delete(`/year_level/${id}`);
  }

  // School Years
  async getSchoolYears() {
    return this.get('/school_year');
  }

  async getSchoolYear(id: string) {
    return this.get(`/school_year/${id}`);
  }

  async createSchoolYear(schoolYearData: any) {
    return this.post('/school_year', schoolYearData);
  }

  async updateSchoolYear(id: string, schoolYearData: any) {
    return this.put(`/school_year/${id}`, schoolYearData);
  }

  async deleteSchoolYear(id: string) {
    return this.delete(`/school_year/${id}`);
  }

  // Student Year Level Assignments
  async getStudentYearLevels() {
    return this.get('/student_year_level');
  }

  async getStudentYearLevel(id: string) {
    return this.get(`/student_year_level/${id}`);
  }

  async createStudentYearLevel(assignmentData: any) {
    return this.post('/student_year_level', assignmentData);
  }

  async updateStudentYearLevel(id: string, assignmentData: any) {
    return this.put(`/student_year_level/${id}`, assignmentData);
  }

  async deleteStudentYearLevel(id: string) {
    return this.delete(`/student_year_level/${id}`);
  }

  // Classrooms
  async getClassrooms() {
    return this.get('/classroom');
  }

  async getClassroom(id: string) {
    return this.get(`/classroom/${id}`);
  }

  async createClassroom(classroomData: any) {
    return this.post('/classroom', classroomData);
  }

  async updateClassroom(id: string, classroomData: any) {
    return this.put(`/classroom/${id}`, classroomData);
  }

  async deleteClassroom(id: string) {
    return this.delete(`/classroom/${id}`);
  }

  // Classroom Types
  async getClassroomTypes() {
    return this.get('/classroom_types');
  }

  async getClassroomType(id: string) {
    return this.get(`/classroom_types/${id}`);
  }

  async createClassroomType(classroomTypeData: any) {
    return this.post('/classroom_types', classroomTypeData);
  }

  async updateClassroomType(id: string, classroomTypeData: any) {
    return this.put(`/classroom_types/${id}`, classroomTypeData);
  }

  async deleteClassroomType(id: string) {
    return this.delete(`/classroom_types/${id}`);
  }

  // Teacher-Department Assignments
  async getTeacherDepartments(teacherId?: string) {
    if (teacherId) {
      return this.get(`/teacher-department/${teacherId}`);
    }
    return this.get('/teacher-department');
  }

  async assignTeacherToDepartment(teacherId: string, departmentId: string) {
    return this.post('/teacher-department', {
      teacher_id: teacherId,
      department_id: departmentId
    });
  }

  async removeTeacherFromDepartment(teacherId: string, departmentId: string) {
    return this.delete(`/teacher-department/${teacherId}/${departmentId}`);
  }

  // Student-Year Level Assignments
  async getStudentYearLevelAssignments(studentId?: string) {
    if (studentId) {
      return this.get(`/student-year-level-assignment/${studentId}`);
    }
    return this.get('/student-year-level-assignment');
  }

  async assignStudentToYearLevel(studentId: string, levelId: string) {
    return this.post('/student-year-level-assignment', {
      student_id: studentId,
      level_id: levelId
    });
  }

  async removeStudentFromYearLevel(studentId: string, levelId: string) {
    return this.delete(`/student-year-level-assignment/${studentId}/${levelId}`);
  }

  // Terms
  async getTerms() {
    return this.get('/term');
  }

  async getTerm(id: string) {
    return this.get(`/term/${id}`);
  }

  async createTerm(termData: any) {
    return this.post('/term', termData);
  }

  async updateTerm(id: string, termData: any) {
    return this.put(`/term/${id}`, termData);
  }

  async deleteTerm(id: string) {
    return this.delete(`/term/${id}`);
  }

  // Periods
  async getPeriods() {
    return this.get('/period');
  }

  async getPeriod(id: string) {
    return this.get(`/period/${id}`);
  }

  async createPeriod(periodData: any) {
    return this.post('/period', periodData);
  }

  async updatePeriod(id: string, periodData: any) {
    return this.put(`/period/${id}`, periodData);
  }

  async deletePeriod(id: string) {
    return this.delete(`/period/${id}`);
  }

  // Score Ranges
  async getScoreRanges() {
    return this.get('/score_range');
  }

  async getScoreRange(id: string) {
    return this.get(`/score_range/${id}`);
  }

  async createScoreRange(scoreRangeData: any) {
    return this.post('/score_range', scoreRangeData);
  }

  async updateScoreRange(id: string, scoreRangeData: any) {
    return this.put(`/score_range/${id}`, scoreRangeData);
  }

  async deleteScoreRange(id: string) {
    return this.delete(`/score_range/${id}`);
  }

  // Guardians
  async getGuardians() {
    return this.get('/guardian');
  }

  async getGuardian(id: string) {
    return this.get(`/guardian/${id}`);
  }

  async createGuardian(guardianData: any) {
    return this.post('/guardian', guardianData);
  }

  async createGuardianWithStudent(guardianData: any, studentId: string, guardianTypeId: string) {
    const data = {
      ...guardianData,
      student_id: studentId,
      guardian_type_id: guardianTypeId
    };
    return this.post('/guardian', data);
  }

  async updateGuardian(id: string, guardianData: any) {
    return this.put(`/guardian/${id}`, guardianData);
  }

  async deleteGuardian(id: string) {
    return this.delete(`/guardian/${id}`);
  }

  // Guardian Types (nested under guardian)
  async getGuardianTypes() {
    return this.get('/guardian/types');
  }

  async getGuardianType(id: string) {
    return this.get(`/guardian/types/${id}`);
  }

  async createGuardianType(guardianTypeData: any) {
    return this.post('/guardian/types', guardianTypeData);
  }

  async updateGuardianType(id: string, guardianTypeData: any) {
    return this.put(`/guardian/types/${id}`, guardianTypeData);
  }

  async deleteGuardianType(id: string) {
    return this.delete(`/guardian/types/${id}`);
  }

  // Student-Guardian Relationships
  async getStudentGuardians() {
    return this.get('/student_guardian');
  }

  async createStudentGuardian(studentGuardianData: any) {
    return this.post('/student_guardian', studentGuardianData);
  }

  // ========== Phase 3: Grading System ==========

  // Assessment Types
  async getAssessmentTypes() {
    return this.get('/assessment_type');
  }

  async getAssessmentType(id: string) {
    return this.get(`/assessment_type/${id}`);
  }

  async createAssessmentType(assessmentTypeData: any) {
    return this.post('/assessment_type', assessmentTypeData);
  }

  async updateAssessmentType(id: string, assessmentTypeData: any) {
    const data = { ...assessmentTypeData, _id: id };
    return this.put('/assessment_type', data);
  }

  async deleteAssessmentType(id: string) {
    return this.delete(`/assessment_type/${id}`);
  }

  // Assignments
  async getAssignments(filters?: { class_id?: string; term_id?: string; subject_id?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.class_id) params.append('class_id', filters.class_id);
    if (filters?.term_id) params.append('term_id', filters.term_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    return this.get(queryString ? `/assignment?${queryString}` : '/assignment');
  }

  async getAssignment(id: string) {
    return this.get(`/assignment/${id}`);
  }

  async getTeacherAssignments() {
    return this.get('/assignment/teacher');
  }

  async createAssignment(assignmentData: any) {
    return this.post('/assignment', assignmentData);
  }

  async updateAssignment(id: string, assignmentData: any) {
    const data = { ...assignmentData, _id: id };
    return this.put('/assignment', data);
  }

  async deleteAssignment(id: string) {
    return this.delete(`/assignment/${id}`);
  }

  // Grades (Student Assignments)
  async getGrades(filters?: { assignment_id?: string; student_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.assignment_id) params.append('assignment_id', filters.assignment_id);
    if (filters?.student_id) params.append('student_id', filters.student_id);
    const queryString = params.toString();
    return this.get(queryString ? `/grade?${queryString}` : '/grade');
  }

  async getGrade(id: string) {
    return this.get(`/grade/${id}`);
  }

  async createOrUpdateGrade(gradeData: any) {
    return this.post('/grade', gradeData);
  }

  async deleteGrade(id: string) {
    return this.delete(`/grade/${id}`);
  }

  // Gradebook
  async getGradebook(classId: string, termId?: string) {
    const params = new URLSearchParams();
    if (termId) params.append('term_id', termId);
    const queryString = params.toString();
    return this.get(queryString ? `/gradebook/class/${classId}?${queryString}` : `/gradebook/class/${classId}`);
  }

  // Student Assignments
  async getStudentAssignments(filters?: { term_id?: string; subject_id?: string; status?: string; year_id?: string; class_name?: string }) {
    const params = new URLSearchParams();
    if (filters?.term_id) params.append('term_id', filters.term_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.year_id) params.append('year_id', filters.year_id);
    if (filters?.class_name) params.append('class_name', filters.class_name);
    const queryString = params.toString();
    return this.get(queryString ? `/student/assignments?${queryString}` : '/student/assignments');
  }

  // Teacher Schedule
  async getTeacherSchedule() {
    return this.get('/teacher/schedule');
  }

  // ========== Phase 4: Attendance System ==========
  
  // Attendance
  async getAttendance(filters?: { student_id?: string; class_id?: string; date?: string; start_date?: string; end_date?: string; subject_id?: string; term_id?: string; year_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.student_id) params.append('student_id', filters.student_id);
    if (filters?.class_id) params.append('class_id', filters.class_id);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.term_id) params.append('term_id', filters.term_id);
    if (filters?.year_id) params.append('year_id', filters.year_id);
    const queryString = params.toString();
    return this.get(queryString ? `/attendance?${queryString}` : '/attendance');
  }

  async getAttendanceRecord(id: string) {
    return this.get(`/attendance/${id}`);
  }

  async saveAttendance(attendanceData: any) {
    return this.post('/attendance', attendanceData);
  }

  async deleteAttendance(id: string) {
    return this.delete(`/attendance/${id}`);
  }

  async getAttendanceRoster(classId: string, date: string) {
    return this.get(`/attendance/roster/${classId}?date=${date}`);
  }

  // ========== Term Grades ==========
  
  async getTermGrades(filters?: { student_id?: string; subject_id?: string; term_id?: string; class_id?: string; year_id?: string; class_name?: string; is_finalized?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.student_id) params.append('student_id', filters.student_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.term_id) params.append('term_id', filters.term_id);
    if (filters?.class_id) params.append('class_id', filters.class_id);
    if (filters?.year_id) params.append('year_id', filters.year_id);
    if (filters?.class_name) params.append('class_name', filters.class_name);
    if (filters?.is_finalized !== undefined) params.append('is_finalized', filters.is_finalized.toString());
    const queryString = params.toString();
    return this.get(queryString ? `/term_grade?${queryString}` : '/term_grade');
  }

  async getTermGrade(id: string) {
    return this.get(`/term_grade/${id}`);
  }

  async updateTermGrade(id: string, gradeData: any) {
    return this.put(`/term_grade/${id}`, gradeData);
  }

  async deleteTermGrade(id: string) {
    return this.delete(`/term_grade/${id}`);
  }

  async calculateTermGrades(data: any) {
    return this.post('/term_grade/calculate', data);
  }

  // ========== Grading Criteria ==========
  
  async getGradingCriteria(filters?: { subject_id?: string; year_level_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.year_level_id) params.append('year_level_id', filters.year_level_id);
    const queryString = params.toString();
    return this.get(queryString ? `/grading_criteria?${queryString}` : '/grading_criteria');
  }

  async getGradingCriterion(id: string) {
    return this.get(`/grading_criteria/${id}`);
  }

  async createGradingCriteria(criteriaData: any) {
    return this.post('/grading_criteria', criteriaData);
  }

  async updateGradingCriteria(id: string, criteriaData: any) {
    return this.put(`/grading_criteria/${id}`, criteriaData);
  }

  async deleteGradingCriteria(id: string) {
    return this.delete(`/grading_criteria/${id}`);
  }

  // ========== Resources ==========
  
  async getResources(filters?: { school_year_id?: string; subject_id?: string; year_level_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.school_year_id) params.append('school_year_id', filters.school_year_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.year_level_id) params.append('year_level_id', filters.year_level_id);
    const queryString = params.toString();
    return this.get(queryString ? `/resource?${queryString}` : '/resource');
  }

  async getResource(id: string) {
    return this.get(`/resource/${id}`);
  }

  async uploadResource(file: File, title: string, description: string, schoolYearId: string, subjectId: string, yearLevelId?: string) {
    try {
      const url = `${this.baseURL}/resource`;
      const token = await authService.getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('school_year_id', schoolYearId);
      formData.append('subject_id', subjectId);
      if (yearLevelId) {
        formData.append('year_level_id', yearLevelId);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data || null,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  async updateResource(id: string, resourceData: { title?: string; description?: string }) {
    const data = { ...resourceData, _id: id };
    return this.put('/resource', data);
  }

  async deleteResource(id: string) {
    return this.delete(`/resource/${id}`);
  }

  async downloadResource(id: string): Promise<Blob | null> {
    try {
      const url = `${this.baseURL}/resource/${id}/download`;
      const token = await authService.getAccessToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error: any) {
      console.error('Error downloading resource:', error);
      return null;
    }
  }

  async getTeacherResources(filters?: { school_year_id?: string; subject_id?: string; year_level_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.school_year_id) params.append('school_year_id', filters.school_year_id);
    if (filters?.subject_id) params.append('subject_id', filters.subject_id);
    if (filters?.year_level_id) params.append('year_level_id', filters.year_level_id);
    const queryString = params.toString();
    return this.get(queryString ? `/resource/teacher?${queryString}` : '/resource/teacher');
  }

}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
