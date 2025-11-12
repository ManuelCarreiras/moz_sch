-- Create grading_criteria table for admin-defined grade calculation rules
-- Defines ONCE per subject+year_level, applies to ALL students in that year

DROP TABLE IF EXISTS grading_criteria CASCADE;

CREATE TABLE grading_criteria (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    year_level_id UUID NOT NULL REFERENCES year_level(_id) ON DELETE CASCADE,
    
    -- Component details
    component_name VARCHAR(255) NOT NULL, -- "Tests", "Homework", "Attendance"
    weight DECIMAL(5,2) NOT NULL, -- Percentage weight (0-100)
    
    -- Source configuration
    source_type VARCHAR(50) NOT NULL, -- 'assignment', 'attendance'
    assessment_type_id UUID REFERENCES assessment_type(_id), -- For 'assignment' source (e.g., Test, Homework)
    
    -- Metadata
    description TEXT,
    created_by UUID REFERENCES professor(_id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_weight CHECK (weight >= 0 AND weight <= 100),
    CONSTRAINT valid_source_type CHECK (source_type IN ('assignment', 'attendance')),
    CONSTRAINT unique_criteria UNIQUE (subject_id, year_level_id, component_name)
);

-- Indexes
CREATE INDEX idx_grading_criteria_subject ON grading_criteria(subject_id);
CREATE INDEX idx_grading_criteria_year_level ON grading_criteria(year_level_id);
CREATE INDEX idx_grading_criteria_source ON grading_criteria(source_type);

-- Comments
COMMENT ON TABLE grading_criteria IS 'Admin-defined rules for calculating grades per subject and year level';
COMMENT ON COLUMN grading_criteria.component_name IS 'Name of component: Tests, Homework, Attendance, etc.';
COMMENT ON COLUMN grading_criteria.weight IS 'Percentage weight in final term grade (0-100)';
COMMENT ON COLUMN grading_criteria.source_type IS 'Where to pull data: assignment (from student_assignment), attendance (from attendance table)';
COMMENT ON COLUMN grading_criteria.assessment_type_id IS 'For assignment source: which type (Test, Homework, Quiz, etc.)';

