-- Add year_level_id column to class table
ALTER TABLE class ADD COLUMN year_level_id UUID REFERENCES year_level(_id);

-- Update existing rows to set a default year level (if you have any)
-- You'll need to replace 'some-year-level-id' with an actual year level ID from your database
-- UPDATE class SET year_level_id = 'some-year-level-id' WHERE year_level_id IS NULL;

-- Make the column NOT NULL if desired (after setting all existing rows)
-- ALTER TABLE class ALTER COLUMN year_level_id SET NOT NULL;

