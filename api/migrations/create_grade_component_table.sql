-- Grade Component table for storing different types of grades
-- This allows teachers to grade students on multiple criteria (tests, homework, attendance, participation, etc.)
-- Each component has a weight that contributes to the final term grade

CREATE TABLE IF NOT EXISTS grade_component (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subject(_id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES term(_id) ON DELETE CASCADE,
    class_id UUID REFERENCES class(_id) ON DELETE SET NULL,
    
    -- Component details
    component_type VARCHAR(50) NOT NULL, -- 'test', 'homework', 'attendance', 'participation', 'behavior', 'project', 'other'
    component_name VARCHAR(255) NOT NULL, -- e.g., "Tests Average", "Class Participation", "Attendance"
    description TEXT,
    
    -- Score
    score DECIMAL(5,2) NOT NULL, -- The grade (0-20 scale)
    max_score DECIMAL(5,2) DEFAULT 20.0, -- Maximum possible score (usually 20)
    weight DECIMAL(5,2) NOT NULL, -- Percentage weight in final grade (e.g., 60 for 60%)
    
    -- Metadata
    notes TEXT,
    created_by UUID REFERENCES professor(_id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= max_score),
    CONSTRAINT valid_weight CHECK (weight >= 0 AND weight <= 100),
    CONSTRAINT unique_component_per_student UNIQUE (student_id, subject_id, term_id, component_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grade_component_student ON grade_component(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_component_subject ON grade_component(subject_id);
CREATE INDEX IF NOT EXISTS idx_grade_component_term ON grade_component(term_id);
CREATE INDEX IF NOT EXISTS idx_grade_component_class ON grade_component(class_id);
CREATE INDEX IF NOT EXISTS idx_grade_component_type ON grade_component(component_type);

-- Comments
COMMENT ON TABLE grade_component IS 'Stores individual grade components that contribute to a student''s final term grade';
COMMENT ON COLUMN grade_component.component_type IS 'Type of grade component: test, homework, attendance, participation, behavior, project, other';
COMMENT ON COLUMN grade_component.weight IS 'Percentage weight of this component in the final term grade (0-100)';
COMMENT ON COLUMN grade_component.score IS 'The grade score on 0-20 scale (or custom max_score)';

