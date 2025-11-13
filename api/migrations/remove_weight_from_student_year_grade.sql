-- Remove total_weight_graded from student_year_grade
-- No longer needed since assignments don't have weights

ALTER TABLE student_year_grade DROP COLUMN IF EXISTS total_weight_graded;

