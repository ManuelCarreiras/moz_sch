// Teacher service - mirrors your backend resources/teacher.py
// This follows the same pattern as your TeacherResource class

import { apiService } from './index';
import { Teacher, ApiResponse } from '../../types';

export class TeacherService {
  // POST /teacher - Create new teacher
  async createTeacher(teacherData: Omit<Teacher, '_id'>): Promise<ApiResponse<Teacher>> {
    return await apiService.post<Teacher>('/teacher', teacherData);
  }

  // GET /teacher/<id> - Get teacher by ID
  async getTeacher(id: string): Promise<ApiResponse<Teacher>> {
    return await apiService.get<Teacher>(`/teacher/${id}`);
  }

  // PUT /teacher - Update teacher
  async updateTeacher(teacherData: Teacher): Promise<ApiResponse<Teacher>> {
    return await apiService.put<Teacher>('/teacher', teacherData);
  }

  // DELETE /teacher/<id> - Delete teacher
  async deleteTeacher(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/teacher/${id}`);
  }
}

export const teacherService = new TeacherService();
