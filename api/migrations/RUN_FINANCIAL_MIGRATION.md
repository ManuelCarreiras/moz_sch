# Financial System - Database Migration Instructions

## Migration File
`create_financial_tables.sql`

## What This Migration Does

Creates tables for tracking student monthly payments (mensality) and teacher monthly salaries, and adds `is_active` column to the student table.

**Changes:**
1. **student_mensality table** - Tracks monthly payment obligations for students
   - Columns: student_id, value, paid, due_date, month, year, payment_date, notes
   - Unique constraint on (student_id, month, year) to prevent duplicates
   
2. **teacher_salary table** - Tracks monthly salary payments for teachers
   - Columns: teacher_id, value, paid, due_date, month, year, payment_date, notes
   - Unique constraint on (teacher_id, month, year) to prevent duplicates

3. **student.is_active column** - Boolean flag to track if student is still enrolled
   - Default value: TRUE (all existing students will be marked as active)

4. **Indexes** - Created for optimal query performance
   - Indexes on foreign keys, month/year, paid status, and due dates

5. **Triggers** - Auto-update `updated_at` timestamp when records are modified

## How to Run

### Option 1: Using Docker (Recommended)

```bash
# From the project root
docker exec -i postgres-db psql -U <database_user> -d <database_name> < api/migrations/create_financial_tables.sql
```

If you're not sure of the database user/name, check your docker-compose.yml or environment variables.

### Option 2: Using psql directly

```bash
# From the api/migrations directory
psql -U <database_user> -d <database_name> -f create_financial_tables.sql
```

### Option 3: Using pgAdmin or DBeaver

1. Open your PostgreSQL client
2. Connect to your database
3. Open `create_financial_tables.sql`
4. Execute the script

### Option 4: Automatic (via API startup)

The migration is also included in the API startup code (`webPlatform_api.py`), so it will run automatically when the API starts if tables don't exist.

## Verification

After running the migration, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('student_mensality', 'teacher_salary');

-- Check student.is_active column
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'student' 
  AND column_name = 'is_active';

-- Should return:
-- column_name: is_active
-- data_type: boolean
-- is_nullable: NO
-- column_default: true

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('student_mensality', 'teacher_salary', 'student')
  AND indexname LIKE '%mensality%' OR indexname LIKE '%salary%' OR indexname LIKE '%is_active%';
```

## Rollback (if needed)

To undo this migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS update_student_mensality_updated_at ON student_mensality;
DROP TRIGGER IF EXISTS update_teacher_salary_updated_at ON teacher_salary;

-- Drop tables (WARNING: This will delete all data!)
DROP TABLE IF EXISTS student_mensality CASCADE;
DROP TABLE IF EXISTS teacher_salary CASCADE;

-- Remove is_active column from student (WARNING: Consider impact on existing queries!)
ALTER TABLE student DROP COLUMN IF EXISTS is_active;
```

## Usage Examples

### Generate Mensality for All Active Students (via API)

```bash
POST /mensality/generate
{
  "month": 11,
  "year": 2025,
  "value": 500.00,
  "due_date": "2025-11-30",
  "notes": "November 2025 mensality"
}
```

### Generate Salary for All Teachers (via API)

```bash
POST /teacher_salary/generate
{
  "month": 11,
  "year": 2025,
  "value": 3000.00,
  "due_date": "2025-11-30",
  "notes": "November 2025 salary"
}
```

Or with individual salaries:

```bash
POST /teacher_salary/generate
{
  "month": 11,
  "year": 2025,
  "due_date": "2025-11-30",
  "salaries": [
    { "teacher_id": "uuid1", "value": 3500.00 },
    { "teacher_id": "uuid2", "value": 3000.00 }
  ]
}
```

### Mark Payment as Paid

```bash
PUT /mensality
{
  "_id": "mensality_uuid",
  "paid": true,
  "payment_date": "2025-11-15"
}
```

## Notes

- This migration is **idempotent** - it can be run multiple times safely
- Uses `IF NOT EXISTS` to prevent errors if tables/columns already exist
- Existing students will have `is_active = TRUE` by default
- Only one mensality/salary record per student/teacher per month/year is allowed
- When marking a payment as paid, the `payment_date` is automatically set to today if not provided

## Next Steps

After running the migration:
1. Restart the API container to ensure models are recognized
2. Test the API endpoints:
   - `GET /mensality` - List all mensality records
   - `POST /mensality/generate` - Generate mensality for all active students
   - `GET /teacher_salary` - List all salary records
   - `POST /teacher_salary/generate` - Generate salaries for all teachers

## Troubleshooting

### Error: "relation student does not exist"
- Make sure the student table was created first
- Run `db.create_all()` in the API or check if student table exists

### Error: "duplicate key value violates unique constraint"
- You're trying to create a duplicate mensality/salary for the same student/teacher, month, and year
- Check if a record already exists before creating a new one

### Error: "column already exists"
- The column was already added - this is safe, the migration uses `IF NOT EXISTS`

## Migration Status

- **Created**: November 15, 2025
- **Phase**: Financial Tracking System
- **Status**: Ready to run
- **Dependencies**: `student` and `professor` tables must exist

