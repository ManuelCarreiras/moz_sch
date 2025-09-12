// School Year service - mirrors your backend resources/school_year.py
// This follows the same pattern as your SchoolYearResource class

import { apiService } from './index';
import { SchoolYear, ApiResponse } from '../../types';

export class SchoolYearService {
  // POST /school_year - Create new school year
  async createSchoolYear(schoolYearData: Omit<SchoolYear, '_id'>): Promise<ApiResponse<SchoolYear>> {
    return await apiService.post<SchoolYear>('/school_year', schoolYearData);
  }

  // GET /school_year/<id> - Get school year by ID
  async getSchoolYear(id: string): Promise<ApiResponse<SchoolYear>> {
    return await apiService.get<SchoolYear>(`/school_year/${id}`);
  }

  // PUT /school_year - Update school year
  async updateSchoolYear(schoolYearData: SchoolYear): Promise<ApiResponse<SchoolYear>> {
    return await apiService.put<SchoolYear>('/school_year', schoolYearData);
  }

  // DELETE /school_year/<id> - Delete school year
  async deleteSchoolYear(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/school_year/${id}`);
  }
}

export const schoolYearService = new SchoolYearService();
