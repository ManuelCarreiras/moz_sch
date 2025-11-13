# Simplified Grading Criteria System

## What Changed

### OLD System (Complex):
- 3 separate rows per subject+year:
  - Algebra, 1st, "Tests", 60%
  - Algebra, 1st, "Homework", 20%
  - Algebra, 1st, "Attendance", 20%
- Had to manage multiple rows
- Could have incomplete configurations

### NEW System (Simple):
- **1 row** per subject+year:
  - Algebra, 1st, tests: 60%, homework: 20%, attendance: 20%
- All components in one place
- Database constraint ensures total = 100%

## Database Structure

```sql
grading_criteria:
├─ subject_id
├─ year_level_id
├─ tests_weight (0-100%)
├─ homework_weight (0-100%)
├─ attendance_weight (0-100%)
└─ CONSTRAINT: tests + homework + attendance = 100%
```

## UI Features

### Clean Single Form
```
Subject: [Algebra]
Year Level: [1]

Component Weights (must total 100%):
┌──────────────────────────────────────────┐
│ 📝 Tests: [60]%                          │
│ 📚 Homework: [20]%                       │
│ ✅ Attendance: [20]%                     │
│                                          │
│ Total: 100% ✅                           │
└──────────────────────────────────────────┘

[Create] [Cancel]
```

### Real-Time Validation
- Shows total as you type
- Green background when total = 100%
- Red/yellow when incorrect
- Create button disabled until valid

### Clean Table View
```
Subject | Year | Tests | Homework | Attendance | Total  | Actions
--------|------|-------|----------|------------|--------|--------
Algebra | 1    | 60%   | 20%      | 20%        | 100% ✅| Edit Delete
Math    | 2    | 50%   | 30%      | 20%        | 100% ✅| Edit Delete
```

## Example Usage

### Creating Criteria for 1st Year Algebra:

1. Go to: **Admin Dashboard → Academic Setup → ⚖️ Grading Criteria**
2. Click **"+ Add Grading Criteria"**
3. Select:
   - Subject: **Algebra**
   - Year Level: **1**
4. Enter weights:
   - Tests: **60**
   - Homework: **20**
   - Attendance: **20**
5. See: **Total: 100% ✅**
6. Click **"Create"**

Done! Now ALL 1st year Algebra students (1st A, 1st B, 1st C) use these weights.

## How It Calculates Grades

### For João in 1st Year Algebra, Term 1:

**Tests (60% weight):**
- Test 1: 16/20 (80%)
- Test 2: 14/20 (70%)
- Average: 75% → 15/20
- Weighted: 15 × 0.60 = **9 points**

**Homework (20% weight):**
- HW1: 18/20, HW2: 20/20, HW3: 19/20
- Average: 95% → 19/20
- Weighted: 19 × 0.20 = **3.8 points**

**Attendance (20% weight):**
- Present: 28/30 days = 93.3% → 18.66/20
- Weighted: 18.66 × 0.20 = **3.73 points**

**Final Grade = 9 + 3.8 + 3.73 = 16.53/20** ✅

## Benefits

1. ✅ **Simpler** - One row instead of three
2. ✅ **Guaranteed valid** - Database enforces 100% total
3. ✅ **Cleaner UI** - All components visible at once
4. ✅ **No duplicates** - Unique per subject+year
5. ✅ **Real-time validation** - See total as you type
6. ✅ **Easy to compare** - All students in same year use same rules

## Migration

Old data has been cleared. Start fresh with new simplified structure!

---

**System ready!** Much simpler than before. 🎯
