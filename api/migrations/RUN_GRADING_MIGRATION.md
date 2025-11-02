# Phase 3 Grading System - Database Migration Instructions

## Migration File
`create_grading_tables.sql`

## What This Migration Does

Creates 4 new tables for the grading system:
1. **assessment_type** - Types of assignments (Homework, Quiz, Test, etc.)
2. **assignment** - Specific assignments created by teachers
3. **student_assignment** - Individual student grades
4. **student_term_grade** - Cached term averages

Also includes:
- Indexes for performance
- Triggers for auto-updating timestamps
- Seed data for 10 common assessment types

## How to Run

### Option 1: Using Docker (Recommended)

```bash
# From the project root
docker exec -i postgres-db psql -U your_username -d your_database < api/migrations/create_grading_tables.sql
```

### Option 2: Using psql directly

```bash
# From the api/migrations directory
psql -U your_username -d your_database -f create_grading_tables.sql
```

### Option 3: Using pgAdmin or DBeaver

1. Open your PostgreSQL client
2. Connect to your database
3. Open `create_grading_tables.sql`
4. Execute the script

## Verification

After running the migration, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('assessment_type', 'assignment', 'student_assignment', 'student_term_grade');

-- Check assessment types were seeded
SELECT * FROM assessment_type ORDER BY type_name;

-- Should return 10 rows:
-- Class Participation
-- Essay
-- Final Exam
-- Homework
-- Lab Work
-- Midterm Exam
-- Presentation
-- Project
-- Quiz
-- Test
```

## Rollback (if needed)

To undo this migration:

```sql
-- Drop tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS student_term_grade CASCADE;
DROP TABLE IF EXISTS student_assignment CASCADE;
DROP TABLE IF EXISTS assignment CASCADE;
DROP TABLE IF EXISTS assessment_type CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_assignment_updated_date ON assignment;
DROP TRIGGER IF EXISTS update_student_assignment_updated_date ON student_assignment;
DROP TRIGGER IF EXISTS update_student_term_grade_last_updated ON student_term_grade;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_date_column();
```

## Notes

- This migration is **idempotent** - it can be run multiple times safely
- Uses `CREATE TABLE IF NOT EXISTS` to prevent errors
- Uses `ON CONFLICT DO NOTHING` for seed data
- All foreign keys use proper CASCADE/SET NULL rules
- Indexes are created for optimal query performance

## Next Steps

After running the migration:
1. Restart the API container to load new models
2. Test the API endpoints:
   - `GET /assessment_type` - should return 10 seeded types
   - `POST /assignment` - create a test assignment
   - `POST /grade` - create a test grade
   - `GET /gradebook/class/<class_id>` - view gradebook

## Troubleshooting

### Error: "relation already exists"
- The tables already exist. This is safe - the migration uses `IF NOT EXISTS`

### Error: "foreign key constraint"
- Make sure Phase 2 migrations are complete (term, period, class, etc.)

### Error: "permission denied"
- Run as a database user with CREATE TABLE privileges
- Or ask your DBA to run the migration

## Migration Status

- **Created**: November 2, 2025
- **Phase**: 3 (Grading System)
- **Status**: Ready to run
- **Dependencies**: Phase 2 tables (student, professor, class, term, subject, score_range)

