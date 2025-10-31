-- Add username column to professor table
-- This allows querying teachers by their Cognito username

ALTER TABLE professor
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teacher_username ON professor(username);

-- Note: Existing teachers will have NULL username values
-- The username will be populated automatically when new teachers are created via the API
-- For existing teachers with Cognito accounts, you may need to manually update the username field

