-- Term Grade table for storing final calculated grades per term
-- This table stores the final grade for a student in a subject for a specific term
-- The grade is calculated from grade_components but can be manually overridden by teachers

CREATE TABLE IF NOT EXISTS term_grade (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES term(_id) ON DELETE CASCADE,
    class_id UUID REFERENCES class(_id) ON DELETE SET NULL,
    
    -- Grade values
    calculated_grade DECIMAL(5,2), -- Auto-calculated from grade_components
    manual_override DECIMAL(5,2), -- Teacher can manually override the calculated grade
    final_grade DECIMAL(5,2) NOT NULL, -- The actual grade used (manual_override if exists, else calculated_grade)
    
    -- Component breakdown (for reference)
    total_weight_entered DECIMAL(5,2), -- Sum of weights from all grade_components
    component_count INTEGER DEFAULT 0, -- Number of grade components
    
    -- Status
    is_finalized BOOLEAN DEFAULT FALSE, -- Whether the grade is locked/finalized
    is_complete BOOLEAN DEFAULT FALSE, -- Whether all required components (100% weight) are entered
    
    -- Metadata
    comments TEXT,
    created_by UUID REFERENCES professor(_id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalized_by UUID REFERENCES professor(_id),
    finalized_date TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_calculated_grade CHECK (calculated_grade IS NULL OR (calculated_grade >= 0 AND calculated_grade <= 20)),
    CONSTRAINT valid_manual_override CHECK (manual_override IS NULL OR (manual_override >= 0 AND manual_override <= 20)),
    CONSTRAINT valid_final_grade CHECK (final_grade >= 0 AND final_grade <= 20),
    CONSTRAINT unique_term_grade UNIQUE (student_id, subject_id, term_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_term_grade_student ON term_grade(student_id);
CREATE INDEX IF NOT EXISTS idx_term_grade_subject ON term_grade(subject_id);
CREATE INDEX IF NOT EXISTS idx_term_grade_term ON term_grade(term_id);
CREATE INDEX IF NOT EXISTS idx_term_grade_class ON term_grade(class_id);
CREATE INDEX IF NOT EXISTS idx_term_grade_finalized ON term_grade(is_finalized);

-- Comments
COMMENT ON TABLE term_grade IS 'Stores final calculated term grades for students in each subject';
COMMENT ON COLUMN term_grade.calculated_grade IS 'Auto-calculated grade from grade_components using weighted average';
COMMENT ON COLUMN term_grade.manual_override IS 'Teacher can manually override the calculated grade';
COMMENT ON COLUMN term_grade.final_grade IS 'The actual grade used (manual_override if exists, else calculated_grade)';
COMMENT ON COLUMN term_grade.is_finalized IS 'Whether the grade is locked and cannot be changed';
COMMENT ON COLUMN term_grade.is_complete IS 'Whether all required components (100% weight) have been entered';

