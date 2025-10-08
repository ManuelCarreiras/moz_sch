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

  // School Years
  async getSchoolYears() {
    return this.get('/school_year');
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

  // Terms
  async getTerms() {
    return this.get('/term');
  }

  // Periods
  async getPeriods() {
    return this.get('/period');
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

}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
