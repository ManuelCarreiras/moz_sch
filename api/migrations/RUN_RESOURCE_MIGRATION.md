# Resource Year Level - Database Migration Instructions

## Migration File
`add_year_level_to_resource.sql`

## What This Migration Does

Adds the `year_level_id` column to the `resource` table to enable grade-level filtering for resources.

**Changes:**
- Adds `year_level_id` column (nullable UUID, references `year_level` table)
- Creates index on `year_level_id` for better query performance
- Column is optional - existing resources will have NULL values

## How to Run

### Option 1: Using Docker (Recommended)

```bash
# From the project root
docker exec -i postgres-db psql -U postgres -d santa_isabel_db < api/migrations/add_year_level_to_resource.sql
```

### Option 2: Using psql directly

```bash
# From the api/migrations directory
psql -U postgres -d santa_isabel_db -f add_year_level_to_resource.sql
```

### Option 3: Using pgAdmin or DBeaver

1. Open your PostgreSQL client
2. Connect to your database
3. Open `add_year_level_to_resource.sql`
4. Execute the script

## Verification

After running the migration, verify the column was added:

```sql
-- Check column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'resource' 
  AND column_name = 'year_level_id';

-- Should return:
-- column_name: year_level_id
-- data_type: uuid
-- is_nullable: YES

-- Check index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'resource' 
  AND indexname = 'idx_resource_year_level_id';
```

## Rollback (if needed)

To undo this migration:

```sql
-- Drop index first
DROP INDEX IF EXISTS idx_resource_year_level_id;

-- Drop column
ALTER TABLE resource DROP COLUMN IF EXISTS year_level_id;
```

## Notes

- This migration is **idempotent** - it can be run multiple times safely
- Uses `IF NOT EXISTS` to prevent errors if column already exists
- Existing resources will have `year_level_id = NULL` (resources are still accessible)
- Foreign key constraint uses `ON DELETE SET NULL` - if a year level is deleted, resources remain but lose their grade association

## Next Steps

After running the migration:
1. Restart the API container to ensure the model changes are recognized
2. Test the API endpoints:
   - `POST /resource` - upload a resource with year_level_id
   - `GET /resource?year_level_id=<id>` - filter resources by grade
   - `GET /resource/teacher?year_level_id=<id>` - filter teacher resources by grade

## Troubleshooting

### Error: "relation resource does not exist"
- Make sure the resource table was created first
- Run `db.create_all()` in the API or check if resource table exists

### Error: "column already exists"
- The column was already added - this is safe, the migration uses `IF NOT EXISTS`

### Error: "foreign key constraint"
- Make sure the `year_level` table exists
- Verify year_level_id values reference valid year_level records

## Migration Status

- **Created**: November 15, 2025
- **Phase**: Resources System
- **Status**: Ready to run
- **Dependencies**: `year_level` table must exist

