-- Drop and recreate grading_criteria with simplified structure
-- One row per subject+year_level with all component weights

DROP TABLE IF EXISTS grading_criteria CASCADE;

CREATE TABLE grading_criteria (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    year_level_id UUID NOT NULL REFERENCES year_level(_id) ON DELETE CASCADE,
    
    -- Component weights (must add up to 100%)
    tests_weight DECIMAL(5,2) NOT NULL DEFAULT 0,
    homework_weight DECIMAL(5,2) NOT NULL DEFAULT 0,
    attendance_weight DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Metadata
    description TEXT,
    created_by UUID REFERENCES professor(_id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_tests_weight CHECK (tests_weight >= 0 AND tests_weight <= 100),
    CONSTRAINT valid_homework_weight CHECK (homework_weight >= 0 AND homework_weight <= 100),
    CONSTRAINT valid_attendance_weight CHECK (attendance_weight >= 0 AND attendance_weight <= 100),
    CONSTRAINT total_weight_100 CHECK ((tests_weight + homework_weight + attendance_weight) = 100),
    CONSTRAINT unique_subject_year UNIQUE (subject_id, year_level_id)
);

-- Indexes
CREATE INDEX idx_grading_criteria_subject ON grading_criteria(subject_id);
CREATE INDEX idx_grading_criteria_year_level ON grading_criteria(year_level_id);

-- Comments
COMMENT ON TABLE grading_criteria IS 'Admin-defined grading weights per subject and year level - one row per combination';
COMMENT ON COLUMN grading_criteria.tests_weight IS 'Percentage weight for tests (0-100)';
COMMENT ON COLUMN grading_criteria.homework_weight IS 'Percentage weight for homework (0-100)';
COMMENT ON COLUMN grading_criteria.attendance_weight IS 'Percentage weight for attendance (0-100)';
COMMENT ON CONSTRAINT total_weight_100 ON grading_criteria IS 'Ensures tests + homework + attendance = 100%';

