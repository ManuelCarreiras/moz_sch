-- Add username column to student table
-- This allows querying students by their Cognito username

ALTER TABLE student
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_username ON student(username);

-- Note: Existing students will have NULL username values
-- The username will be populated automatically when new students are created via the API
-- For existing students with Cognito accounts, you may need to manually update the username field

