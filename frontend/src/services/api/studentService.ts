// Student service - mirrors your backend resources/student.py
// This follows the same pattern as your StudentResource class

import { apiService } from './index';
import { Student, ApiResponse } from '../../types';

export class StudentService {
  // POST /student - Create new student
  async createStudent(studentData: Omit<Student, '_id'>): Promise<ApiResponse<Student>> {
    return await apiService.post<Student>('/student', studentData);
  }

  // GET /student/<id> - Get student by ID
  async getStudent(id: string): Promise<ApiResponse<Student>> {
    return await apiService.get<Student>(`/student/${id}`);
  }

  // PUT /student - Update student
  async updateStudent(studentData: Student): Promise<ApiResponse<Student>> {
    return await apiService.put<Student>('/student', studentData);
  }

  // DELETE /student/<id> - Delete student
  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/student/${id}`);
  }
}

export const studentService = new StudentService();
