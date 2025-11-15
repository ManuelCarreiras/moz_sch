-- Add is_scored field to assessment_type to distinguish between scored vs completion-based assignments
-- Tests/Quizzes are scored (0-20), Homework is completion-based (done/not done)

ALTER TABLE assessment_type 
ADD COLUMN IF NOT EXISTS is_scored BOOLEAN DEFAULT TRUE;

-- Update existing types
-- Homework and Participation are completion-based
UPDATE assessment_type SET is_scored = FALSE WHERE type_name IN ('Homework', 'Participation');

-- Everything else is scored (Test, Quiz, Project, Lab, Presentation, etc.)
UPDATE assessment_type SET is_scored = TRUE WHERE type_name NOT IN ('Homework', 'Participation');

-- Comment
COMMENT ON COLUMN assessment_type.is_scored IS 'TRUE if assignments require a score (0-20), FALSE if completion-based (done/not done)';

