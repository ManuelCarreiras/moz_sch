# Teacher Portal Implementation Notes

This document outlines the considerations and steps needed to implement teacher portal features similar to what was done for students.

## 🎯 Overview

Similar to the student portal implementation, we need to:
1. Add Cognito username integration for teachers
2. Create teacher schedule/timetable view
3. Implement authentication-based lookup
4. Add teacher-specific portal features

## 📋 Key Differences from Student Implementation

### 1. **Email Field Name**
- **Students**: Use `email` field
- **Teachers**: Use `email_address` field
- **Action**: Update lookup logic to use `email_address` for teachers

### 2. **Name Structure**
- **Students**: Have `given_name`, `middle_name`, `surname`
- **Teachers**: Only have `given_name`, `surname` (no `middle_name`)
- **Action**: Username generation will be: `first_initial + surname` (e.g., "John Smith" → "jsmith")
- **Note**: If we add `middle_name` to teachers later, use same format as students

### 3. **Cognito Group**
- **Students**: Added to 'student' group
- **Teachers**: Should be added to 'teacher' or 'teachers' group
- **Action**: Use `AWS_COGNITO_TEACHER_GROUP` environment variable (default: 'teacher')

### 4. **Schedule View Requirements**
- **Students**: View classes they're enrolled in
- **Teachers**: View classes they teach
- **Query**: Need to join `Class` model where `teacher_id` matches authenticated teacher
- **Filtering**: Same as students (by term and year)

## 🔧 Implementation Checklist

### Phase 1: Database & Model Updates
- [ ] Add `username` column to `professor` table (VARCHAR(100), UNIQUE, nullable)
- [ ] Create migration script: `add_username_to_teacher.sql`
- [ ] Update `TeacherModel.__init__()` to accept `username` parameter
- [ ] Update `TeacherModel.json()` to include `username`
- [ ] Update `TeacherModel.update_entry()` to handle `username`
- [ ] Add `TeacherModel.find_by_username()` class method
- [ ] Add `TeacherModel.find_by_email()` - already exists but uses `email_address`

### Phase 2: Cognito Integration
- [ ] Update `TeacherResource.post()` to create Cognito user
- [ ] Generate username: `given_name[0].lower() + surname.lower()` (e.g., "John Smith" → "jsmith")
- [ ] Use `email_address` instead of `email` for Cognito user creation
- [ ] Add user to 'teacher' or 'teachers' Cognito group
- [ ] Save generated username to teacher record
- [ ] Handle `UsernameExistsException` (same as students)
- [ ] Make Cognito creation fault-tolerant (catch `NoCredentialsError`)
- [ ] Send welcome email with temporary password (remove `MessageAction='SUPPRESS'`)

### Phase 3: Teacher Schedule Endpoint
- [ ] Create `api/resources/teacher_schedule.py`
- [ ] Implement `TeacherScheduleResource.get()` method
- [ ] Extract username/email from JWT token (`g.username`, `g.email`)
- [ ] Look up teacher by username (fallback to `email_address`)
- [ ] Query `ClassModel` where `teacher_id` matches
- [ ] Filter by `term_id` and `year_id` query parameters
- [ ] Join with `SubjectModel`, `PeriodModel`, `ClassroomModel`, `YearLevelModel`
- [ ] Return timetable data with:
  - Subject name
  - Period name, start time, end time
  - Day of week
  - Classroom name
  - Year level information
  - Term and year information
- [ ] Return `available_terms` and `available_years` for frontend filtering
- [ ] Return `all_periods` for grid rendering
- [ ] Register route: `/teacher/schedule` and `/teacher/schedule/<teacher_id>`

### Phase 4: Authentication Middleware
- [ ] Verify `valid_auth.py` already extracts username (should be generic)
- [ ] Ensure `g.username` is available for teacher endpoints
- [ ] Verify teacher group detection works (already implemented)

### Phase 5: Frontend Teacher Schedule Component
- [ ] Create `frontend/src/components/TeacherSchedule.tsx`
- [ ] Implement grid layout (days of week × periods)
- [ ] Add year and term filter dropdowns
- [ ] Use `apiService.get('/teacher/schedule')`
- [ ] Handle authentication via JWT token
- [ ] Display classes with subject, period, classroom info
- [ ] Read-only view (no edit/delete for now)

### Phase 6: Teacher Dashboard Updates
- [ ] Add "Schedule" tab to `TeacherDashboard.tsx`
- [ ] Import and render `TeacherSchedule` component
- [ ] Verify "Create Teacher" button is admin-only (check if already implemented)
- [ ] Ensure teacher creation form includes email validation

### Phase 7: Role-Based Access Control
- [ ] Verify `@require_role('admin')` decorator on `TeacherResource.post()`, `put()`, `delete()`
- [ ] Check if teacher creation button is admin-only in frontend
- [ ] Test that teachers can view their schedule but not create/modify teachers

## 🎨 UI/UX Considerations

### Teacher Schedule View
- Similar grid layout as student schedule
- Show all classes teacher teaches (not just one year level)
- Consider grouping by year level if teacher teaches multiple levels
- Show class name (e.g., "1st A") alongside subject
- Display student count per class (future enhancement)

### Teacher Portal Features (Future)
- View list of students enrolled in their classes
- Grade entry interface (Phase 3 of roadmap)
- Attendance tracking (future)
- Class announcements (future)
- Assignment management (future)

## 🔍 Key Implementation Details

### Username Generation Logic
```python
# For teachers (no middle name):
given_name = (data.get('given_name') or '').strip()
surname = (data.get('surname') or '').strip()

username_parts = []
if given_name:
    username_parts.append(given_name[0].lower())
if surname:
    username_parts.append(surname.lower())

unique_username = ''.join(username_parts)  # e.g., "jsmith"
```

### Teacher Schedule Query
```python
# Get all classes where teacher_id matches
classes = ClassModel.query.filter_by(teacher_id=teacher._id).all()

# Filter by term and year
# Join with related models for full data
```

### Environment Variables
Add to Doppler/configuration:
- `AWS_COGNITO_TEACHER_GROUP` (default: 'teacher' or 'teachers')
- Same AWS credentials as student implementation

## 📝 Testing Checklist

- [ ] Teacher creation creates Cognito user
- [ ] Username is saved to database
- [ ] Teacher added to correct Cognito group
- [ ] Teacher can login with generated username
- [ ] Force password change works for teachers
- [ ] Teacher schedule endpoint authenticates correctly
- [ ] Teacher schedule returns correct classes
- [ ] Filtering by term/year works
- [ ] Admin can view any teacher's schedule
- [ ] Teacher can only view their own schedule
- [ ] Teacher cannot create/modify teachers (admin-only)

## 🚨 Potential Issues & Solutions

### Issue 1: Email Field Mismatch
**Problem**: Teachers use `email_address`, students use `email`  
**Solution**: Use `email_address` consistently in teacher-related code

### Issue 2: No Middle Name
**Problem**: Teachers don't have middle name field  
**Solution**: Use simpler username format (first initial + surname)

### Issue 3: Username Collisions
**Problem**: Multiple teachers with same initials (e.g., "John Smith" and "Jane Smith")  
**Solution**: Same handling as students - add numeric suffix or use full email prefix

### Issue 4: Multiple Department Assignment
**Problem**: Teachers can belong to multiple departments  
**Solution**: Already handled via junction table - no changes needed

## 📚 Reference Files

### Student Implementation (Reference)
- `api/models/student.py` - Username field and methods
- `api/resources/student.py` - Cognito user creation
- `api/resources/student_schedule.py` - Schedule endpoint
- `api/utils/valid_auth.py` - Username extraction
- `frontend/src/components/StudentSchedule.tsx` - Frontend component
- `frontend/src/components/StudentDashboard.tsx` - Dashboard integration

### Teacher Files to Update
- `api/models/teacher.py` - Add username field
- `api/resources/teacher.py` - Add Cognito integration
- `api/resources/teacher_schedule.py` - New file
- `frontend/src/components/TeacherSchedule.tsx` - New component
- `frontend/src/components/TeacherDashboard.tsx` - Add schedule tab

## 🔄 Migration Considerations

1. **Existing Teachers**: Will have NULL username until updated
2. **Cognito Users**: May need to manually map existing Cognito users to teachers
3. **Username Uniqueness**: Ensure unique constraint handles collisions
4. **Data Consistency**: Verify all teachers with Cognito accounts have username stored

## 📋 Next Steps After Teacher Implementation

1. **Guardian Portal**: Similar pattern (username, schedule if applicable)
2. **Teacher-Specific Features**: Grade entry, attendance, assignments
3. **Multi-Schedule Views**: View schedules across multiple terms/years
4. **Class Management**: Teachers managing their classes (student enrollment, grades)

---

**Created**: October 31, 2025  
**Status**: Planning Phase - Ready for implementation after student portal testing

