-- Add fields to grade_component to support auto-calculation from assignments

ALTER TABLE grade_component 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS assignment_ids UUID[],
ADD COLUMN IF NOT EXISTS auto_calculate BOOLEAN DEFAULT FALSE;

-- Update constraint to allow source_type values
COMMENT ON COLUMN grade_component.source_type IS 'Source of the grade: manual, auto_calculated, attendance';
COMMENT ON COLUMN grade_component.assignment_ids IS 'Array of assignment IDs used for auto-calculation (if source_type = auto_calculated)';
COMMENT ON COLUMN grade_component.auto_calculate IS 'Whether this component should be auto-recalculated when assignments change';

-- Create index for auto_calculate queries
CREATE INDEX IF NOT EXISTS idx_grade_component_auto ON grade_component(auto_calculate) WHERE auto_calculate = TRUE;

