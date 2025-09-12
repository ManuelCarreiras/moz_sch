// Student Class service - mirrors your backend resources/student_class.py
// This follows the same pattern as your StudentClassResource class

import { apiService } from './index';
import { StudentClass, ApiResponse } from '../../types';

export class StudentClassService {
  // GET /student_class/student/<id> - Get student's classes
  async getStudentClasses(studentId: string): Promise<ApiResponse<StudentClass[]>> {
    return await apiService.get<StudentClass[]>(`/student_class/student/${studentId}`);
  }

  // GET /student_class/class/<id> - Get class enrollment
  async getClassEnrollment(classId: string): Promise<ApiResponse<StudentClass[]>> {
    return await apiService.get<StudentClass[]>(`/student_class/class/${classId}`);
  }
}

export const studentClassService = new StudentClassService();
