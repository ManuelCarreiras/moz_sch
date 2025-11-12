# Grade Component System - How It Works

## Overview
Grades are now calculated using **components** (Tests, Attendance, Behavior, Homework, etc.) that combine to make term grades, which then combine to make year grades.

## System Flow

```
student_assignment (individual test scores)
    ↓ (auto-calculates)
grade_component "Tests" (average of all tests)
    +
grade_component "Attendance" (manual entry)
    +
grade_component "Behavior" (manual entry)
    +
grade_component "Homework" (manual entry)
    ↓ (weighted sum)
term_grade (final grade for the term)
    ↓ (weighted average of all terms)
student_year_grade (final year grade)
```

## Example: Algebra Term 1

### Step 1: Create Grade Components

**POST /grade_component**
```json
{
  "student_id": "uuid-of-student",
  "subject_id": "uuid-of-algebra",
  "term_id": "uuid-of-term-1",
  "component_name": "Tests",
  "score": 15.0,
  "weight": 80
}
```

```json
{
  "student_id": "uuid-of-student",
  "subject_id": "uuid-of-algebra",
  "term_id": "uuid-of-term-1",
  "component_name": "Attendance",
  "score": 20.0,
  "weight": 5
}
```

```json
{
  "student_id": "uuid-of-student",
  "subject_id": "uuid-of-algebra",
  "term_id": "uuid-of-term-1",
  "component_name": "Behavior",
  "score": 20.0,
  "weight": 5
}
```

```json
{
  "student_id": "uuid-of-student",
  "subject_id": "uuid-of-algebra",
  "term_id": "uuid-of-term-1",
  "component_name": "Homework",
  "score": 20.0,
  "weight": 10
}
```

### Step 2: Term Grade is Auto-Calculated

**Calculation:**
- Tests: 15 × 0.80 = 12.0
- Attendance: 20 × 0.05 = 1.0
- Behavior: 20 × 0.05 = 1.0
- Homework: 20 × 0.10 = 2.0
- **Total = 16.0**

This is automatically stored in `term_grade` table.

### Step 3: When You Grade Assignments

**POST /grade** (to grade a test)
```json
{
  "student_id": "uuid-of-student",
  "assignment_id": "uuid-of-test",
  "score": 85,
  "status": "graded"
}
```

**What happens automatically:**
1. Score saved to `student_assignment` table
2. "Tests" component auto-recalculates (average of all test scores)
3. Term grade auto-recalculates from all components
4. Year grade auto-recalculates from all term grades

## API Endpoints

### Get Components for a Student
```
GET /grade_component?student_id=XXX&subject_id=YYY&term_id=ZZZ
```

**Response:**
```json
{
  "grade_components": [
    {
      "_id": "...",
      "component_name": "Tests",
      "score": 15.0,
      "weight": 80,
      "is_auto_calculated": true
    },
    {
      "_id": "...",
      "component_name": "Attendance",
      "score": 20.0,
      "weight": 5,
      "is_auto_calculated": false
    }
  ],
  "total_weight": 100,
  "is_complete": true
}
```

### Create/Update Component
```
POST /grade_component
```

### Update Component Score
```
PUT /grade_component/<component_id>
```

### Delete Component
```
DELETE /grade_component/<component_id>
```

## Auto-Calculated vs Manual Components

### Auto-Calculated (Tests/Homework)
- Set `is_auto_calculated: true`
- Score automatically updates when assignments are graded
- Cannot be manually edited unless `force_update: true`

### Manual (Attendance/Behavior)
- Set `is_auto_calculated: false`
- Teacher manually sets the score
- Can be updated anytime

## Term Weights for Year Grade

Currently year grades use equal weight for all terms. To customize term weights:

**Option 1:** Store weights in database (future enhancement)
**Option 2:** Calculate manually using term grades

Example:
```
Term 1 (50% weight): 16
Term 2 (50% weight): 15
Year Grade = (16 × 0.5) + (15 × 0.5) = 15.5 ≈ 16
```

## Teacher Override

Teachers can override any grade:

**PUT /term_grade/<grade_id>**
```json
{
  "manual_override": 17.0
}
```

This overrides the calculated grade but keeps the calculation for reference.

## Key Points

1. ✅ Weights must add up to 100% for complete grades
2. ✅ Scores are always on 0-20 scale
3. ✅ Everything auto-updates when assignments are graded
4. ✅ Teachers can manually enter non-test components
5. ✅ Teachers can override final grades if needed

