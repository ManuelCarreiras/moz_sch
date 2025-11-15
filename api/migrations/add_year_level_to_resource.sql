-- Migration: Add year_level_id column to resource table and make uploaded_by nullable
-- Date: 2025-11-15
-- Description: Adds optional year_level_id column to resource table to allow filtering by grade level.
--              Also makes uploaded_by nullable to allow admins to upload resources without a teacher record.

-- Add year_level_id column if it doesn't exist
ALTER TABLE resource 
ADD COLUMN IF NOT EXISTS year_level_id UUID REFERENCES year_level(_id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_resource_year_level_id ON resource(year_level_id);

-- Make uploaded_by nullable to allow admin uploads (if not already nullable)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resource' 
        AND column_name = 'uploaded_by' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE resource ALTER COLUMN uploaded_by DROP NOT NULL;
    END IF;
END $$;

-- Add comment to column
COMMENT ON COLUMN resource.year_level_id IS 'Optional reference to year_level (grade). Resources can be shared across all year levels with the same level_order (e.g., 1st A, 1st B share resources).';
COMMENT ON COLUMN resource.uploaded_by IS 'Reference to professor (teacher) who uploaded the resource. NULL for admin-uploaded resources.';

