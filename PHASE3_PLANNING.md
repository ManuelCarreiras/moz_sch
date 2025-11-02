# Phase 3: Assignments, Evaluations & Grading System - Implementation Plan

## 📋 Overview

This document outlines the complete implementation strategy for the grading system in Santa Isabel Escola. Phase 3 builds upon the completed Phase 2 (Academic Foundation) and integrates with existing score ranges, subjects, classes, and terms.

---

## 🎯 **Core Concepts**

### **3-Tier Architecture**

```
Tier 1: Assessment Types (Foundation)
         ↓
Tier 2: Assignments (What students do)
         ↓
Tier 3: Grades (Results & scoring)
```

---

## 📊 **Data Model**

### **Entity Relationships**

```
AssessmentType (1) ----→ (many) Assignment
Subject (1) -----------→ (many) Assignment
Class (1) -------------→ (many) Assignment
Term (1) --------------→ (many) Assignment
Teacher (1) -----------→ (many) Assignment (created_by)

Assignment (1) --------→ (many) StudentAssignment (grades)
Student (1) -----------→ (many) StudentAssignment

Student (1) + Class (1) + Term (1) → (1) StudentTermGrade (cached average)
```

### **Database Tables**

#### **1. assessment_type**
```sql
_id UUID PRIMARY KEY
type_name VARCHAR(50) UNIQUE    -- "Homework", "Quiz", "Test", "Project", etc.
description TEXT
created_date TIMESTAMP
```

**Seed Data:**
- Homework
- Quiz
- Test/Exam
- Midterm Exam
- Final Exam
- Project
- Lab Work
- Presentation
- Class Participation
- Essay/Composition

---

#### **2. assignment**
```sql
_id UUID PRIMARY KEY
title VARCHAR(200) NOT NULL
description TEXT
subject_id UUID NOT NULL → subject(_id)
class_id UUID NOT NULL → class(_id)
assessment_type_id UUID NOT NULL → assessment_type(_id)
term_id UUID NOT NULL → term(_id)
due_date TIMESTAMP
max_score DECIMAL(5,2) DEFAULT 100.00
weight DECIMAL(5,2) DEFAULT 10.00     -- percentage of final grade
status VARCHAR(20) DEFAULT 'draft'    -- draft, published, closed
created_date TIMESTAMP
created_by UUID → professor(_id)
```

**Example:**
```json
{
  "title": "Chapter 5 Algebra Quiz",
  "description": "Quadratic equations and graphing",
  "subject_id": "algebra-uuid",
  "class_id": "1st-A-algebra-uuid",
  "assessment_type_id": "quiz-uuid",
  "term_id": "term-1-2026-uuid",
  "due_date": "2026-02-15T10:00:00",
  "max_score": 100,
  "weight": 15,  // 15% of final grade
  "status": "published",
  "created_by": "teacher-uuid"
}
```

---

#### **3. student_assignment**
```sql
_id UUID PRIMARY KEY
student_id UUID NOT NULL → student(_id)
assignment_id UUID NOT NULL → assignment(_id)
score DECIMAL(5,2)
submission_date TIMESTAMP
graded_date TIMESTAMP
feedback TEXT
status VARCHAR(20) DEFAULT 'not_submitted'  -- not_submitted, submitted, graded, late
UNIQUE(student_id, assignment_id)
```

**Example:**
```json
{
  "student_id": "john-doe-uuid",
  "assignment_id": "quiz-5-uuid",
  "score": 87.50,
  "submission_date": "2026-02-15T09:45:00",
  "graded_date": "2026-02-16T14:30:00",
  "feedback": "Good work! Watch your algebra notation.",
  "status": "graded"
}
```

---

#### **4. student_term_grade** (Cache table)
```sql
_id UUID PRIMARY KEY
student_id UUID NOT NULL → student(_id)
class_id UUID NOT NULL → class(_id)
term_id UUID NOT NULL → term(_id)
calculated_average DECIMAL(5,2)
letter_grade VARCHAR(2)
score_range_id UUID → score_range(_id)
last_updated TIMESTAMP
UNIQUE(student_id, class_id, term_id)
```

**Purpose:** Cache calculated averages to avoid recalculating on every request.

---

## 🧮 **Grade Calculation Algorithm**

### **Weighted Average Formula**

```python
def calculate_term_grade(student_id, class_id, term_id):
    # Get all assignments for this class and term
    assignments = Assignment.query.filter_by(
        class_id=class_id, 
        term_id=term_id, 
        status='published'
    ).all()
    
    total_weighted_score = 0
    total_weight = 0
    
    for assignment in assignments:
        # Get student's grade for this assignment
        grade = StudentAssignment.query.filter_by(
            student_id=student_id,
            assignment_id=assignment._id,
            status='graded'
        ).first()
        
        if grade and grade.score is not None:
            # Calculate weighted score
            percentage = (grade.score / assignment.max_score) * 100
            weighted_score = percentage * assignment.weight
            
            total_weighted_score += weighted_score
            total_weight += assignment.weight
    
    # Calculate final average
    if total_weight > 0:
        average = total_weighted_score / total_weight
    else:
        average = None
    
    # Convert to letter grade using score_range
    letter_grade = get_letter_grade(average, subject.score_range_id)
    
    return {
        'calculated_average': round(average, 2),
        'letter_grade': letter_grade,
        'total_weight': total_weight
    }
```

### **Letter Grade Conversion**

```python
def get_letter_grade(percentage, score_range_id):
    # Get all score ranges for this subject
    ranges = ScoreRange.query.filter_by(
        _id=score_range_id  # Or subject has multiple ranges
    ).all()
    
    for range in sorted(ranges, key=lambda r: r.min_score, reverse=True):
        if percentage >= range.min_score and percentage <= range.max_score:
            return range.grade  # Returns 'A', 'B', 'C', etc.
    
    return 'F'  # Default if below all ranges
```

---

## 🎨 **UI/UX Design**

### **Teacher Gradebook Interface**

```
┌─────────────────────────────────────────────────────────────────┐
│ Gradebook: 1st A - Algebra (Term 1, 2026)                       │
├─────────────────────────────────────────────────────────────────┤
│ [+ New Assignment]  [Import Grades]  [Export CSV]               │
├─────────────────────────────────────────────────────────────────┤
│ Student Name    │ HW1 │ Quiz1 │ Test1 │ HW2 │ Final │ Average   │
│                 │ 10% │  15%  │  25%  │ 10% │  40%  │           │
├─────────────────────────────────────────────────────────────────┤
│ John Doe        │ 95  │  88   │  92   │ 100 │   85  │ 89.25 B+ │
│ Jane Smith      │ 78  │  91   │  85   │  88  │   -   │ 85.05 B  │
│ Maria Santos    │ 100 │  95   │  98   │  92  │   -   │ 96.15 A  │
└─────────────────────────────────────────────────────────────────┘

Color coding:
- Green: >= 90% (A range)
- Blue: 80-89% (B range)  
- Yellow: 70-79% (C range)
- Red: < 70% (D/F range)
- Gray: Not yet graded (-)
```

### **Student Grade View**

```
┌─────────────────────────────────────────────────────────────────┐
│ My Grades - Term 1, 2026                                         │
├─────────────────────────────────────────────────────────────────┤
│ Algebra (1st A)                          Current Grade: 89% (B+) │
├─────────────────────────────────────────────────────────────────┤
│ Assignment              │ Type    │ Due Date │ Score  │ Feedback │
├─────────────────────────────────────────────────────────────────┤
│ Chapter 1 Homework      │ HW      │ Jan 15   │ 95/100 │ ⭐ Great!│
│ Quiz 1: Equations       │ Quiz    │ Jan 22   │ 88/100 │ Good work│
│ Midterm Exam           │ Test    │ Feb 10   │ 92/100 │ Excellent│
│ Chapter 2 Homework      │ HW      │ Feb 20   │100/100 │ Perfect! │
│ Final Exam             │ Final   │ Mar 5    │   -    │ Upcoming │
└─────────────────────────────────────────────────────────────────┘

📊 Grade Breakdown:
- Homework (20%): 97.5%
- Quizzes (15%): 88.0%
- Tests (25%): 92.0%
- Final (40%): Not graded

💡 What-If: If you get 85% on the Final, your grade will be 88.9% (B+)
```

---

## 🚀 **Implementation Roadmap**

### **Week 5: Foundation**

#### **Backend (Days 1-2)**
1. Create `assessment_type` model and resource
2. Create `assignment` model with all relationships
3. Create `student_assignment` model
4. Create `student_term_grade` model
5. Write migration scripts
6. Seed assessment types

#### **Backend (Days 3-4)**
7. Implement assignment CRUD API
8. Implement grade entry API
9. Implement grade calculation service
10. Write tests for all new endpoints

#### **Frontend (Day 5)**
11. Create AssessmentTypeTable component
12. Create basic assignment management interface
13. Test API integration

---

### **Week 6: Gradebook**

#### **Backend (Days 1-2)**
1. Create gradebook API endpoint
   - Return students × assignments grid
   - Include calculated averages
   - Support bulk grade updates
2. Implement grade analytics endpoint
3. Add teacher permission checks

#### **Frontend (Days 3-5)**
4. Create Gradebook component
   - Spreadsheet-like interface
   - Inline editing with auto-save
   - Color-coded cells
5. Create Assignment Creation Wizard
6. Add assignment list view
7. Integrate with TeacherDashboard

---

### **Week 7: Student Views**

#### **Backend (Days 1-2)**
1. Create student grade API endpoints
2. Implement grade calculation for student view
3. Add parent/guardian access endpoints

#### **Frontend (Days 3-5)**
4. Create StudentGrades component
5. Create AssignmentList component for students
6. Add grade widgets to StudentDashboard
7. Implement What-If calculator
8. Add GuardianGradeView component

---

### **Week 8: Advanced Features**

#### **Backend (Days 1-3)**
1. Implement CSV import/export
2. Create report card generation (PDF)
3. Add grade analytics and charts
4. Implement alert system

#### **Frontend (Days 4-5)**
5. Add bulk import interface
6. Create analytics dashboard
7. Add grade distribution charts
8. Polish and bug fixes

---

## 🎨 **Component Structure**

```
frontend/src/components/
├── admin/
│   ├── AssessmentTypeTable.tsx      # Manage assessment types
│   ├── AssignmentWizard.tsx         # Create assignments
│   ├── AssignmentList.tsx           # View all assignments
│   └── GradeAnalytics.tsx           # Teacher analytics
├── teacher/
│   ├── Gradebook.tsx                # Main gradebook spreadsheet
│   ├── AssignmentManager.tsx        # Teacher assignment management
│   └── ClassGradeOverview.tsx       # Class performance summary
├── student/
│   ├── StudentGrades.tsx            # Student grade view
│   ├── StudentAssignments.tsx       # Assignment list
│   ├── GradeCalculator.tsx          # What-If calculator
│   └── GradeWidgets.tsx             # Dashboard widgets
└── guardian/
    └── GuardianGradeView.tsx        # Parent grade access
```

---

## 🔑 **Key Decisions to Make Tomorrow**

### **1. Grading Scale Configuration**
- **Question**: Can teachers customize score ranges per subject, or school-wide only?
- **Options**:
  - A) One school-wide grading scale (90-100=A, 80-89=B, etc.)
  - B) Per-subject customization (Math uses different scale than PE)
  - C) Per-assignment customization (Tests graded differently than homework)
- **Recommendation**: Option B (per-subject, already implemented with score_range!)

### **2. Weight Management**
- **Question**: How to handle weights that don't add up to 100%?
- **Options**:
  - A) Strict validation: weights must sum to 100%
  - B) Normalize: auto-scale weights to 100%
  - C) Allow flexibility: weights can sum to any value
- **Recommendation**: Option B (normalize for flexibility)

### **3. Missing Grades**
- **Question**: How to handle ungraded assignments in average calculation?
- **Options**:
  - A) Treat as 0% (penalizes student)
  - B) Exclude from average (doesn't penalize)
  - C) Configurable per assignment
- **Recommendation**: Option B (exclude from average)

### **4. Late Submissions**
- **Question**: Automatic penalty for late submissions?
- **Options**:
  - A) No penalty (teacher decides)
  - B) Configurable penalty per assignment (e.g., -10% per day)
  - C) School-wide policy
- **Recommendation**: Start with Option A, add B later

### **5. Grade Visibility**
- **Question**: When do students see grades?
- **Options**:
  - A) Immediately when teacher enters
  - B) Teacher manually "releases" grades
  - C) Auto-release on specific date
- **Recommendation**: Option B (teacher control)

---

## 🛠️ **MVP Features (Start Here)**

### **Minimum Viable Product (Week 5-6)**

1. ✅ Assessment type CRUD
2. ✅ Assignment creation (teacher)
3. ✅ Assignment list view (teacher)
4. ✅ Gradebook grid (teacher)
5. ✅ Simple grade entry
6. ✅ Weighted average calculation
7. ✅ Student grade view (read-only)
8. ✅ Basic API endpoints

### **What to Skip for MVP**
- ❌ File uploads
- ❌ Bulk import/export
- ❌ Report card PDF
- ❌ Advanced analytics
- ❌ Alert system
- ❌ Grade history/audit
- ❌ What-If calculator
- ❌ Parent portal integration

**Add these in Week 7-8 after MVP is working!**

---

## 📝 **Sample User Stories**

### **Teacher Flow**
1. Teacher logs in, goes to "My Classes"
2. Selects "1st A - Algebra - Term 1, 2026"
3. Clicks "Create Assignment"
4. Fills in:
   - Title: "Chapter 5 Quiz"
   - Type: Quiz
   - Due: Feb 15, 2026
   - Max Score: 100
   - Weight: 15%
   - Status: Published
5. Students can now see the assignment
6. On Feb 16, teacher clicks "Gradebook"
7. Sees grid of students × assignments
8. Clicks each cell, types score, hits Enter
9. Scores auto-save
10. Average column updates automatically

### **Student Flow**
1. Student logs in, goes to "My Grades"
2. Sees all subjects with current averages
3. Clicks "Algebra"
4. Sees list of assignments:
   - Graded: Shows score and feedback
   - Upcoming: Shows due date
5. Current term average displayed: "89% (B+)"
6. Can see which assignments are missing

---

## ⚡ **Quick Start Checklist for Tomorrow**

### **Before You Start Coding**
- [ ] Review this plan
- [ ] Make decisions on the 5 key questions above
- [ ] Sketch gradebook UI on paper
- [ ] Confirm grade calculation formula
- [ ] Decide on MVP scope

### **Day 1 Tasks**
- [ ] Create migration: `create_grading_tables.sql`
- [ ] Create `assessment_type.py` model
- [ ] Create `assignment.py` model
- [ ] Create `student_assignment.py` model
- [ ] Create `student_term_grade.py` model
- [ ] Run migrations
- [ ] Seed assessment types

### **Day 2 Tasks**
- [ ] Create `assessment_type.py` resource (API)
- [ ] Create `assignment.py` resource (API)
- [ ] Create `grade.py` resource (API)
- [ ] Test endpoints with Postman/curl
- [ ] Register routes in `webPlatform_api.py`

---

## 💡 **Pro Tips**

### **1. Start Simple**
- Don't build everything at once
- Get basic grade entry working first
- Add complexity gradually

### **2. Reuse Patterns**
- Use same wizard pattern as StudentWizard/TeacherWizard
- Follow same API response structure
- Copy modal styling from existing components

### **3. Test Early**
- Test grade calculation with edge cases:
  - All assignments graded
  - Some assignments graded
  - No assignments graded
  - Weights don't sum to 100%
  - Score exceeds max_score

### **4. Performance Matters**
- Cache term averages (student_term_grade table)
- Use indexes on foreign keys
- Paginate gradebook (max 50 students at once)
- Debounce auto-save (500ms)

### **5. Think About Teachers**
- They need to enter 100+ grades quickly
- Keyboard navigation is critical (Tab, Enter, Arrow keys)
- Bulk operations save hours of work
- Visual feedback prevents errors

---

## 🎯 **Success Criteria**

### **Phase 3 is Complete When:**

1. ✅ Teachers can create assignments in < 2 minutes
2. ✅ Teachers can grade an entire class in < 10 minutes
3. ✅ Students see grades within 1 minute of teacher entry
4. ✅ Grade calculations are accurate to 2 decimal places
5. ✅ System handles 1000+ students without performance issues
6. ✅ All CRUD operations have proper error handling
7. ✅ Role-based access control works (teachers can't see other teachers' grades)
8. ✅ Report cards generate in < 5 seconds
9. ✅ Parent portal shows real-time grades
10. ✅ Full test coverage (>80%) for grading logic

---

## 🤔 **Questions for Tomorrow**

1. Should we allow teachers to edit grades after they're published?
2. Should students see partial averages (based on graded assignments only)?
3. Do we need attendance integration for participation grades?
4. Should there be a "grade dispute" feature?
5. Do we want automatic grade posting (e.g., every Friday at 5pm)?

---

**Ready to build!** 🚀

This plan provides a clear, phased approach to implementing a professional grading system. Start with the MVP, get it working, then add advanced features incrementally.

