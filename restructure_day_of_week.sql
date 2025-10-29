-- Migration to restructure day_of_week from period to class
-- This makes periods day-independent, and days are assigned when scheduling classes

-- Step 1: Add day_of_week column to class table
ALTER TABLE class ADD COLUMN IF NOT EXISTS day_of_week INTEGER;

-- Step 2: Drop old unique constraint on class table (if it exists)
ALTER TABLE class DROP CONSTRAINT IF EXISTS unique_year_level_period;

-- Step 3: Add new unique constraint with day_of_week
-- This allows same period on different days for the same year level
ALTER TABLE class 
ADD CONSTRAINT unique_year_level_period_day 
UNIQUE (year_level_id, period_id, day_of_week);

-- Note: We don't drop day_of_week from period table yet to avoid breaking existing data
-- The application code no longer uses period.day_of_week

