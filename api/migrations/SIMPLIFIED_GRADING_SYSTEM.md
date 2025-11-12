# Simplified 4-Table Grading System

## Overview
Clean, simple grading system with only 4 tables that auto-calculates grades from existing data.

## The 4 Tables

### 1. **`student_assignment`** (Already exists)
- Individual test and homework scores
- Already populated when teachers grade assignments

### 2. **`attendance`** (Updated with `subject_id`)
- Attendance records per subject
- Now tracks which subject each attendance belongs to
- Used to calculate attendance percentage

### 3. **`grading_criteria`** (NEW - Admin-only)
- **Rules** for how to calculate grades
- Defined ONCE per subject + year_level
- Applies to ALL students in that year

### 4. **`term_grade`** (Exists, updated logic)
- Final calculated grades
- Auto-calculated from criteria
- Can be manually overridden by teachers

## How It Works

### Step 1: Admin Defines Criteria (One Time)

**Example: Algebra for 1st Year Students**

```http
POST /grading_criteria
```

```json
{
  "subject_id": "algebra-uuid",
  "year_level_id": "1st-year-uuid",
  "component_name": "Tests",
  "weight": 60,
  "source_type": "assignment",
  "assessment_type_id": "test-uuid"
}
```

```json
{
  "subject_id": "algebra-uuid",
  "year_level_id": "1st-year-uuid",
  "component_name": "Homework",
  "weight": 20,
  "source_type": "assignment",
  "assessment_type_id": "homework-uuid"
}
```

```json
{
  "subject_id": "algebra-uuid",
  "year_level_id": "1st-year-uuid",
  "component_name": "Attendance",
  "weight": 20,
  "source_type": "attendance"
}
```

**Total Weight: 100%** ✅

Now ALL 1st year Algebra students (1st A, 1st B, 1st C) use these same criteria!

### Step 2: Teachers Grade Assignments (Normal Workflow)

```http
POST /grade
```

```json
{
  "student_id": "joao-uuid",
  "assignment_id": "test-1-uuid",
  "score": 16,
  "status": "graded"
}
```

**What Happens Automatically:**
1. Score saved to `student_assignment`
2. Term grade auto-recalculates:
   - Gets all Tests for João → calculates average
   - Gets all Homework for João → calculates average  
   - Gets Attendance for João → calculates percentage
   - Applies weights (60%, 20%, 20%)
   - Saves to `term_grade`

### Step 3: Teachers Mark Attendance

```http
POST /attendance
```

```json
{
  "student_id": "joao-uuid",
  "class_id": "1st-a-uuid",
  "subject_id": "algebra-uuid",
  "date": "2025-11-11",
  "status": "present"
}
```

**What Happens Automatically:**
- Attendance percentage recalculates
- Term grade updates automatically

## Example Calculation

### João - Algebra - Term 1

**Grading Criteria (Admin-defined):**
- Tests: 60% weight
- Homework: 20% weight
- Attendance: 20% weight

**João's Scores:**

**Tests (from `student_assignment`):**
- Test 1: 16/20 (80%)
- Test 2: 14/20 (70%)
- Average: 75% → 15/20

**Homework (from `student_assignment`):**
- HW 1: 18/20 (90%)
- HW 2: 20/20 (100%)
- HW 3: 19/20 (95%)
- Average: 95% → 19/20

**Attendance (from `attendance`):**
- 28 present out of 30 classes
- Percentage: 93.3% → 18.66/20

**Final Calculation:**
```
Term Grade = (15 × 0.60) + (19 × 0.20) + (18.66 × 0.20)
          = 9.0 + 3.8 + 3.73
          = 16.53
          ≈ 16.5/20
```

## Comparing Students

**João (1st A):** 16.5/20  
**Maria (1st B):** 17.2/20  
**Pedro (1st C):** 15.8/20

All calculated with same criteria → **Fair comparison**! ✅

## API Endpoints

### Admin: Manage Criteria
```http
GET    /grading_criteria?subject_id=X&year_level_id=Y
POST   /grading_criteria
PUT    /grading_criteria/<id>
DELETE /grading_criteria/<id>
```

### Teachers: Grade Assignments (Existing)
```http
POST /grade
```
→ Automatically triggers term grade calculation

### Teachers: Mark Attendance (Existing)
```http
POST /attendance
```
→ Make sure to include `subject_id`!

### View Term Grades
```http
GET /term_grade?student_id=X&subject_id=Y&term_id=Z
```

## Key Features

✅ **No Behavior Component** - Simplified for now  
✅ **Auto-Calculated** - Everything updates automatically  
✅ **Fair Comparison** - Same criteria for all students in year level  
✅ **Admin-Controlled** - Only admins can change criteria  
✅ **Simple** - Only 4 tables, no complex relationships  

## Migration Steps

1. ✅ Create `grading_criteria` table
2. ✅ Add `subject_id` to `attendance` table  
3. ✅ Update `term_grade` calculation logic
4. ✅ Admin creates criteria for each subject+year_level
5. ✅ Grade assignments as normal - everything auto-updates!

## Future Enhancements

- **Behavior Component** - Add manual entry if needed
- **Term Weights** - Weight Term 1 vs Term 2 vs Term 3 for year grade
- **Custom Formulas** - More complex calculation methods
- **Component Templates** - Quick setup for common subjects

---

**System Status:** ✅ **READY TO USE**

