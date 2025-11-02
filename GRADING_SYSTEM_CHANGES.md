# Grading System Changes - Portuguese/Mozambican System

## ✅ Changes Made

Based on your feedback, I've updated the grading system to match the Portuguese/Mozambican educational system:

### 1. **Scale Changed: 0-20 instead of 0-100 with letters**
- ❌ **Old**: Percentage (0-100%) converted to letter grades (A, B, C, D, F)
- ✅ **New**: Numerical scale (0.00 to 20.00)

### 2. **Year Grades instead of Term Grades**
- ❌ **Old**: Cached grade per student per class per term
- ✅ **New**: Cached grade per student per subject per school year

### 3. **Simpler Data Model**
- ❌ **Old**: `student_term_grade` table with `letter_grade` and `score_range_id`
- ✅ **New**: `student_year_grade` table with just `calculated_average` (0-20 scale)

---

## 📊 New Structure

### **Database Table: `student_year_grade`**

```sql
CREATE TABLE student_year_grade (
    _id UUID PRIMARY KEY,
    student_id UUID → student(_id),
    subject_id UUID → subject(_id),      -- Changed from class_id
    year_id UUID → school_year(_id),     -- Changed from term_id
    calculated_average DECIMAL(4,2),     -- 0.00 to 20.00 (not 0-100)
    total_weight_graded DECIMAL(5,2),
    last_updated TIMESTAMP
);
```

### **Key Changes:**
1. **`class_id` → `subject_id`**: Grades are per subject, not per class instance
2. **`term_id` → `year_id`**: Grades are annual, not per term
3. **Removed `letter_grade`**: No letter grades in Portuguese system
4. **Removed `score_range_id`**: No need for letter grade conversion
5. **`calculated_average` range**: `DECIMAL(4,2)` with CHECK (0-20) instead of (0-100)

---

## 🧮 Grade Calculation Logic

### **How It Works:**

1. **Teacher enters scores** (can be any scale, e.g., 0-100, 0-10, etc.)
2. **System calculates percentage** per assignment
3. **Applies weights** to get weighted average (0-100 scale internally)
4. **Converts to 0-20 scale** for final grade
5. **Aggregates across all terms** in the school year

### **Formula:**

```python
# Step 1: Calculate weighted average on 0-100 scale
for each assignment in subject across all terms:
    percentage = (student_score / max_score) × 100
    weighted_score += percentage × assignment_weight

average_100 = weighted_score / total_weight

# Step 2: Convert to 0-20 scale
average_20 = (average_100 / 100) × 20
```

### **Example:**

```
Student: Maria Santos
Subject: Mathematics
Year: 2026

Term 1 Assignments:
- Quiz 1 (weight 10%): 85/100 = 85% → 85 × 0.10 = 8.5
- Test 1 (weight 20%): 92/100 = 92% → 92 × 0.20 = 18.4

Term 2 Assignments:
- Quiz 2 (weight 10%): 78/100 = 78% → 78 × 0.10 = 7.8
- Final (weight 60%): 88/100 = 88% → 88 × 0.60 = 52.8

Weighted Sum = 8.5 + 18.4 + 7.8 + 52.8 = 87.5
Total Weight = 10 + 20 + 10 + 60 = 100

Average (0-100) = 87.5 / 100 = 87.5%
Average (0-20) = 87.5 / 100 × 20 = 17.5

Final Grade: 17.5 / 20
```

---

## 📝 Files Modified

### **1. Model Renamed**
- **Old**: `api/models/student_term_grade.py`
- **New**: `api/models/student_year_grade.py`

### **2. Migration Script Updated**
- **File**: `api/migrations/create_grading_tables.sql`
- **Changes**:
  - Table name: `student_term_grade` → `student_year_grade`
  - Columns updated
  - Indexes updated
  - Triggers updated
  - Constraints updated (0-20 range)

### **3. API Resource Updated**
- **File**: `api/resources/grade.py`
- **Changes**:
  - Imported `StudentYearGradeModel` instead of `StudentTermGradeModel`
  - `_recalculate_term_grade()` → `_recalculate_year_grade()`
  - Updated calculation to aggregate across all terms in a year
  - Converts final average to 0-20 scale
  - Removed letter grade logic

### **4. Gradebook Updated**
- **File**: `api/resources/grade.py` (GradebookResource)
- **Changes**:
  - `term_average` → `year_average`
  - Removed `letter_grade` field
  - Displays year average on 0-20 scale

---

## 🔄 Migration Path

### **If you haven't run the migration yet:**
✅ **Good news!** Just run the updated `create_grading_tables.sql` and you're done.

### **If you already ran the old migration:**
You'll need to:

1. **Drop the old table**:
```sql
DROP TABLE IF EXISTS student_term_grade CASCADE;
```

2. **Create the new table**:
```sql
-- Run the updated migration script
-- It will create student_year_grade instead
```

---

## 🎯 What This Means

### **For Students:**
- Final grade displayed as **17.5 / 20** instead of "B+" or "87%"
- Grade is **annual** (across all terms) not per term
- One grade per subject per year

### **For Teachers:**
- Enter scores in any scale (the assignment max_score defines it)
- System converts everything to 0-20 automatically
- Can still use weights (%)
- Grade aggregates across all terms automatically

### **For Report Cards:**
- Display format: **15.5 / 20** or just **15.5**
- Easy to understand
- Matches Portuguese/Mozambican standards
- No letter grade conversion needed

---

## ✅ Benefits of This Approach

1. **Culturally Appropriate**: Matches Portuguese/Mozambican grading system
2. **Simpler**: No letter grade conversion needed
3. **More Accurate**: Decimal precision (15.75 vs rounding to B+)
4. **Annual View**: One comprehensive grade per subject per year
5. **Flexible Input**: Teachers can use any scale for assignments

---

## 🚫 What We Removed

1. ❌ Letter grades (A, B, C, D, F)
2. ❌ Score range integration for grading
3. ❌ Per-term caching (now per-year)
4. ❌ Class-level grades (now subject-level)

---

## 📌 Next Steps

1. **Run the updated migration** (`create_grading_tables.sql`)
2. **Restart the API** to load the new model
3. **Test grade calculation**:
   - Create assignments
   - Enter scores
   - Verify year average appears on 0-20 scale
4. **Update frontend** to display grades as "X / 20" format

---

## 💡 Future Enhancements

### **Could Add:**
- Pass/Fail threshold (e.g., 10/20 = passing)
- Grade categories (Excellent: 18-20, Good: 15-17, etc.)
- Honor roll (students with average >= 16)
- Report card templates with 0-20 scale

---

**Last Updated**: November 2, 2025
**Status**: ✅ Complete - Ready for testing

