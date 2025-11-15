-- Migration: Create financial tracking tables (Student Mensality and Teacher Salary)
-- Date: 2025-11-15
-- Description: Creates tables for tracking student monthly payments (mensality) and teacher monthly salaries

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. STUDENT MENSAILITY TABLE
-- ============================================================================
-- Tracks monthly payment obligations for students

CREATE TABLE IF NOT EXISTS student_mensality (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(_id) ON DELETE CASCADE,
    value NUMERIC(10, 2) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    due_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Ensure only one mensality record per student per month/year
    UNIQUE(student_id, month, year)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_mensality_student_id ON student_mensality(student_id);
CREATE INDEX IF NOT EXISTS idx_student_mensality_month_year ON student_mensality(month, year);
CREATE INDEX IF NOT EXISTS idx_student_mensality_paid ON student_mensality(paid);
CREATE INDEX IF NOT EXISTS idx_student_mensality_due_date ON student_mensality(due_date);

-- Add comment
COMMENT ON TABLE student_mensality IS 'Tracks monthly payment obligations (mensality) for students';

-- ============================================================================
-- 2. TEACHER SALARY TABLE
-- ============================================================================
-- Tracks monthly salary payments for teachers

CREATE TABLE IF NOT EXISTS teacher_salary (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES professor(_id) ON DELETE CASCADE,
    value NUMERIC(10, 2) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    due_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Ensure only one salary record per teacher per month/year
    UNIQUE(teacher_id, month, year)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teacher_salary_teacher_id ON teacher_salary(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_salary_month_year ON teacher_salary(month, year);
CREATE INDEX IF NOT EXISTS idx_teacher_salary_paid ON teacher_salary(paid);
CREATE INDEX IF NOT EXISTS idx_teacher_salary_due_date ON teacher_salary(due_date);

-- Add comment
COMMENT ON TABLE teacher_salary IS 'Tracks monthly salary payments for teachers';

-- ============================================================================
-- 3. ADD is_active COLUMN TO STUDENT TABLE
-- ============================================================================
-- Track if student is still enrolled/active in the school

ALTER TABLE student ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Create index for better query performance when filtering active students
CREATE INDEX IF NOT EXISTS idx_student_is_active ON student(is_active);

-- Update existing students to be active by default (if column was just added)
UPDATE student SET is_active = TRUE WHERE is_active IS NULL;

-- Add comment
COMMENT ON COLUMN student.is_active IS 'Indicates if student is currently enrolled/active in the school';

-- ============================================================================
-- 4. CREATE TRIGGER FOR UPDATING updated_at TIMESTAMP
-- ============================================================================
-- Auto-update updated_at column when records are modified

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for student_mensality
DROP TRIGGER IF EXISTS update_student_mensality_updated_at ON student_mensality;
CREATE TRIGGER update_student_mensality_updated_at
    BEFORE UPDATE ON student_mensality
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for teacher_salary
DROP TRIGGER IF EXISTS update_teacher_salary_updated_at ON teacher_salary;
CREATE TRIGGER update_teacher_salary_updated_at
    BEFORE UPDATE ON teacher_salary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

