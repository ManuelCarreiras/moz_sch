-- Grading Criteria table for storing weight configuration
-- This defines how much each assessment type (test, homework, etc.) counts toward the final grade
-- Teachers set this once per subject/term, then system auto-calculates from student_assignment

CREATE TABLE IF NOT EXISTS grading_criteria (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES term(_id) ON DELETE CASCADE,
    class_id UUID REFERENCES class(_id) ON DELETE CASCADE,
    
    -- Criteria details
    assessment_type_id UUID REFERENCES assessment_type(_id) ON DELETE CASCADE,
    criteria_name VARCHAR(255) NOT NULL, -- e.g., "Tests", "Homework", "Attendance", "Participation"
    criteria_type VARCHAR(50) NOT NULL, -- 'assignment', 'attendance', 'manual'
    weight DECIMAL(5,2) NOT NULL, -- Percentage weight in final grade (e.g., 60 for 60%)
    description TEXT,
    
    -- Metadata
    created_by UUID REFERENCES professor(_id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_weight CHECK (weight >= 0 AND weight <= 100),
    CONSTRAINT unique_criteria UNIQUE (subject_id, term_id, criteria_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grading_criteria_subject ON grading_criteria(subject_id);
CREATE INDEX IF NOT EXISTS idx_grading_criteria_term ON grading_criteria(term_id);
CREATE INDEX IF NOT EXISTS idx_grading_criteria_class ON grading_criteria(class_id);
CREATE INDEX IF NOT EXISTS idx_grading_criteria_assessment_type ON grading_criteria(assessment_type_id);

-- Comments
COMMENT ON TABLE grading_criteria IS 'Defines weight configuration for grade calculation per subject/term';
COMMENT ON COLUMN grading_criteria.criteria_type IS 'Type: assignment (from student_assignment), attendance (from attendance table), manual (teacher enters)';
COMMENT ON COLUMN grading_criteria.weight IS 'Percentage weight of this criteria in the final term grade (0-100)';
COMMENT ON COLUMN grading_criteria.assessment_type_id IS 'Links to assessment_type for assignment-based criteria (NULL for attendance/manual)';

