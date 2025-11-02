-- Phase 3: Grading System - Database Migration
-- Created: November 2, 2025
-- Description: Creates tables for assessment types, assignments, grades, and calculated term grades

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ASSESSMENT TYPES (Foundation)
-- ============================================================================
-- Defines types of assignments (Homework, Quiz, Test, Project, etc.)

CREATE TABLE IF NOT EXISTS assessment_type (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default assessment types
INSERT INTO assessment_type (type_name, description) VALUES
    ('Homework', 'Regular homework assignments'),
    ('Quiz', 'Short quizzes and pop quizzes'),
    ('Test', 'Unit tests and chapter exams'),
    ('Midterm Exam', 'Mid-term examination'),
    ('Final Exam', 'Final examination'),
    ('Project', 'Long-term projects and presentations'),
    ('Lab Work', 'Laboratory assignments and experiments'),
    ('Presentation', 'Oral presentations and reports'),
    ('Class Participation', 'In-class participation and discussion'),
    ('Essay', 'Written essays and compositions')
ON CONFLICT (type_name) DO NOTHING;

-- ============================================================================
-- 2. ASSIGNMENTS
-- ============================================================================
-- Specific assignments created by teachers for classes

CREATE TABLE IF NOT EXISTS assignment (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES class(_id) ON DELETE CASCADE,
    assessment_type_id UUID NOT NULL REFERENCES assessment_type(_id),
    term_id UUID NOT NULL REFERENCES term(_id) ON DELETE CASCADE,
    due_date TIMESTAMP,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    weight DECIMAL(5,2) NOT NULL DEFAULT 10.00,  -- percentage of final grade
    status VARCHAR(20) DEFAULT 'draft',  -- draft, published, closed
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES professor(_id) ON DELETE SET NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_max_score CHECK (max_score > 0),
    CONSTRAINT valid_weight CHECK (weight >= 0 AND weight <= 100),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'closed'))
);

-- ============================================================================
-- 3. STUDENT ASSIGNMENTS (Grades)
-- ============================================================================
-- Individual student grades for each assignment

CREATE TABLE IF NOT EXISTS student_assignment (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(_id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignment(_id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    submission_date TIMESTAMP,
    graded_date TIMESTAMP,
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'not_submitted',  -- not_submitted, submitted, graded, late
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_score CHECK (score >= 0),
    CONSTRAINT valid_grade_status CHECK (status IN ('not_submitted', 'submitted', 'graded', 'late')),
    CONSTRAINT unique_student_assignment UNIQUE(student_id, assignment_id)
);

-- ============================================================================
-- 4. STUDENT YEAR GRADES (Cache)
-- ============================================================================
-- Cached calculated year averages (0-20 scale)
-- This is the final grade that appears on report cards

CREATE TABLE IF NOT EXISTS student_year_grade (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    year_id UUID NOT NULL REFERENCES school_year(_id) ON DELETE CASCADE,
    calculated_average DECIMAL(4,2),  -- 0.00 to 20.00 scale
    total_weight_graded DECIMAL(5,2) DEFAULT 0.00,  -- Track how much has been graded
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_average CHECK (calculated_average >= 0 AND calculated_average <= 20),
    CONSTRAINT unique_student_subject_year UNIQUE(student_id, subject_id, year_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Assignment indexes
CREATE INDEX idx_assignment_class ON assignment(class_id);
CREATE INDEX idx_assignment_term ON assignment(term_id);
CREATE INDEX idx_assignment_subject ON assignment(subject_id);
CREATE INDEX idx_assignment_teacher ON assignment(created_by);
CREATE INDEX idx_assignment_status ON assignment(status);
CREATE INDEX idx_assignment_due_date ON assignment(due_date);

-- Student Assignment indexes
CREATE INDEX idx_student_assignment_student ON student_assignment(student_id);
CREATE INDEX idx_student_assignment_assignment ON student_assignment(assignment_id);
CREATE INDEX idx_student_assignment_status ON student_assignment(status);

-- Student Year Grade indexes
CREATE INDEX idx_student_year_grade_student ON student_year_grade(student_id);
CREATE INDEX idx_student_year_grade_subject ON student_year_grade(subject_id);
CREATE INDEX idx_student_year_grade_year ON student_year_grade(year_id);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Trigger function to update updated_date
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to assignment
CREATE TRIGGER update_assignment_updated_date
    BEFORE UPDATE ON assignment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- Apply trigger to student_assignment
CREATE TRIGGER update_student_assignment_updated_date
    BEFORE UPDATE ON student_assignment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- Apply trigger to student_year_grade
CREATE TRIGGER update_student_year_grade_last_updated
    BEFORE UPDATE ON student_year_grade
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- ============================================================================
-- GRANT PERMISSIONS (Adjust based on your database users)
-- ============================================================================

-- GRANT ALL PRIVILEGES ON assessment_type TO your_db_user;
-- GRANT ALL PRIVILEGES ON assignment TO your_db_user;
-- GRANT ALL PRIVILEGES ON student_assignment TO your_db_user;
-- GRANT ALL PRIVILEGES ON student_year_grade TO your_db_user;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify assessment types were seeded
-- SELECT * FROM assessment_type;

-- Check table structure
-- \d assignment
-- \d student_assignment
-- \d student_year_grade

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMIT;

