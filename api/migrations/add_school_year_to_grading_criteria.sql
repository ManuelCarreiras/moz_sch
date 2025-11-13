-- Add school_year_id to grading_criteria and update unique constraint

-- Drop old unique constraint
ALTER TABLE grading_criteria DROP CONSTRAINT IF EXISTS unique_subject_year;

-- Add school_year_id column
ALTER TABLE grading_criteria 
ADD COLUMN IF NOT EXISTS school_year_id UUID REFERENCES school_year(_id) ON DELETE CASCADE;

-- Create new unique constraint including school_year_id
ALTER TABLE grading_criteria 
ADD CONSTRAINT unique_subject_year_schoolyear UNIQUE (subject_id, year_level_id, school_year_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_grading_criteria_school_year ON grading_criteria(school_year_id);

-- Comment
COMMENT ON COLUMN grading_criteria.school_year_id IS 'School year this criteria applies to (allows different criteria per year)';

