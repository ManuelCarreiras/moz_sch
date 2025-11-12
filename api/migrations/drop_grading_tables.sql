-- Drop grading_criteria and grade_component tables
-- These tables are no longer needed in the simplified system

-- Drop grade_component table first (no foreign key dependencies)
DROP TABLE IF EXISTS grade_component CASCADE;

-- Drop grading_criteria table
DROP TABLE IF EXISTS grading_criteria CASCADE;

-- Note: CASCADE will also drop any foreign key constraints that reference these tables

