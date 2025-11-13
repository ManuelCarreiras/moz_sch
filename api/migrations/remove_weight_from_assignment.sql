-- Remove weight column from assignment table
-- Weight is now defined at the component level in grading_criteria, not per assignment

ALTER TABLE assignment DROP COLUMN IF EXISTS weight;

-- Comment update
COMMENT ON TABLE assignment IS 'Individual assignments - graded equally within their assessment type (Test, Homework, etc.)';

