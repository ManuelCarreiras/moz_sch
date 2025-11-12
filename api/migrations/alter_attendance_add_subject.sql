-- Add subject_id to attendance table to track attendance per subject
-- This allows calculating attendance percentage per subject for grading

ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subject(_id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON attendance(subject_id);

-- Comment
COMMENT ON COLUMN attendance.subject_id IS 'Subject this attendance record belongs to (for subject-specific attendance grading)';

