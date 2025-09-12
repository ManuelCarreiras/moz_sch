// TypeScript types mirroring your backend models
// This follows the same pattern as your backend models/

export interface Student {
  _id: string;
  given_name: string;
  middle_name?: string;
  surname: string;
  date_of_birth: string;
  gender: string;
  enrollment_date: string;
}

export interface Teacher {
  _id: string;
  given_name: string;
  middle_name?: string;
  surname: string;
  gender: string;
  email_address?: string;
  phone_number?: string;
}

export interface SchoolYear {
  _id: string;
  school_year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface YearLevel {
  _id: string;
  year_level_name: string;
  year_level_code: string;
  school_year_id: string;
}

export interface Subject {
  _id: string;
  subject_name: string;
  department_id: string;
}

export interface Department {
  _id: string;
  department_name: string;
  department_code: string;
}

export interface ClassModel {
  _id: string;
  class_name: string;
  subject_id: string;
  teacher_id: string;
  year_level_id: string;
  term_id: string;
  period_id: string;
  classroom_id: string;
}

export interface Classroom {
  _id: string;
  classroom_name: string;
  classroom_code: string;
  capacity: number;
  classroom_type_id: string;
}

export interface ClassroomType {
  _id: string;
  classroom_type_name: string;
  classroom_type_code: string;
}

export interface Term {
  _id: string;
  term_name: string;
  term_code: string;
  school_year_id: string;
}

export interface Period {
  _id: string;
  period_name: string;
  period_code: string;
  start_time: string;
  end_time: string;
}

export interface StudentYearLevel {
  _id: string;
  student_id: string;
  year_level_id: string;
  school_year_id: string;
  enrollment_date: string;
}

export interface StudentClass {
  _id: string;
  student_id: string;
  class_id: string;
  enrollment_date: string;
}

export interface ScoreRange {
  _id: string;
  range_name: string;
  min_score: number;
  max_score: number;
  grade: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: T;
}

export interface ApiError {
  success: false;
  message: string;
}

// User roles from Cognito
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  cognito_groups: string[];
}
