// Student Year Level service - mirrors your backend resources/student_year_level.py
// This follows the same pattern as your StudentYearLevelResource classes

import { apiService } from './index';
import { StudentYearLevel, ApiResponse } from '../../types';

export class StudentYearLevelService {
  // GET /student_year_level/level/<id> - Get students by year level
  async getStudentsByYearLevel(yearLevelId: string): Promise<ApiResponse<StudentYearLevel[]>> {
    return await apiService.get<StudentYearLevel[]>(`/student_year_level/level/${yearLevelId}`);
  }

  // GET /student_year_level/year/<id> - Get students by school year
  async getStudentsBySchoolYear(schoolYearId: string): Promise<ApiResponse<StudentYearLevel[]>> {
    return await apiService.get<StudentYearLevel[]>(`/student_year_level/year/${schoolYearId}`);
  }

  // GET /student_year_level/student/<id> - Get student's year level info
  async getStudentYearLevelInfo(studentId: string): Promise<ApiResponse<StudentYearLevel>> {
    return await apiService.get<StudentYearLevel>(`/student_year_level/student/${studentId}`);
  }
}

export const studentYearLevelService = new StudentYearLevelService();
