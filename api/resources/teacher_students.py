from flask import request, Response, g
from flask_restful import Resource
from models.teacher import TeacherModel
from models.class_model import ClassModel
from models.student_class import StudentClassModel
from models.student import StudentModel
from models.assignment import AssignmentModel
from models.student_assignment import StudentAssignmentModel
from models.attendance import AttendanceModel
from models.assessment_type import AssessmentTypeModel
from models.subject import SubjectModel
from models.term import TermModel
from models.school_year import SchoolYearModel
from models.term_grade import TermGradeModel
from utils.auth_middleware import require_any_role
import json
from collections import defaultdict
from decimal import Decimal


class TeacherStudentsResource(Resource):
    """
    Get teacher's students with performance metrics
    """

    @require_any_role(['admin', 'teacher'])
    def get(self):
        """
        GET /teacher/students?year_id=&term_id=&subject_id=
        Returns list of students enrolled in teacher's classes with:
        - Homework completion ratio
        - Attendance ratio
        - Test average
        """
        try:
            username = g.username if hasattr(g, 'username') else None
            user_role = g.role if hasattr(g, 'role') else None
            
            if not username:
                return {'message': 'Authentication required'}, 401
            
            # Get filters
            year_id = request.args.get('year_id')
            term_id = request.args.get('term_id')
            subject_id = request.args.get('subject_id')
            class_id = request.args.get('class_id')
            class_name = request.args.get('class_name')
            teacher_id_param = request.args.get('teacher_id')  # Allow teacher_id as query parameter for admin
            
            # Get teacher's classes
            if user_role == 'admin':
                # Admin can filter by teacher_id if provided
                if teacher_id_param:
                    teacher_classes = ClassModel.list_by_teacher_id(teacher_id_param)
                else:
                    # Admin sees all classes
                    query = ClassModel.query
                    
                    if subject_id and term_id:
                        query = query.filter_by(subject_id=subject_id, term_id=term_id)
                    elif subject_id:
                        query = query.filter_by(subject_id=subject_id)
                    elif term_id:
                        query = query.filter_by(term_id=term_id)
                    
                    teacher_classes = query.all()
            else:
                # Teacher sees only their classes
                teacher = TeacherModel.find_by_username(username)
                if not teacher:
                    return {'message': 'Teacher not found'}, 404
                
                # Get teacher's classes
                teacher_classes = ClassModel.list_by_teacher_id(teacher._id)
        
            if not teacher_classes:
                return {
                    'success': True,
                    'students': [],
                    'count': 0
                }, 200
            
            # Apply filters
            filtered_classes = []
            for cls in teacher_classes:
                if year_id:
                    term = TermModel.find_by_id(cls.term_id)
                    if not term or str(term.year_id) != str(year_id):
                        continue
                if term_id and str(cls.term_id) != str(term_id):
                    continue
                if subject_id and str(cls.subject_id) != str(subject_id):
                    continue
                if class_id and str(cls._id) != str(class_id):
                    continue
                if class_name and cls.class_name != class_name:
                    continue
                filtered_classes.append(cls)
            
            if not filtered_classes:
                return {
                    'success': True,
                    'students': [],
                    'count': 0
                }, 200
        
            # Get unique students enrolled in these classes
            student_ids = set()
            student_class_map = defaultdict(list)  # student_id -> list of (class_id, subject_id, term_id)
            
            for cls in filtered_classes:
                enrollments = StudentClassModel.find_by_class_id(cls._id)
                for enrollment in enrollments:
                    student_ids.add(enrollment.student_id)
                    student_class_map[enrollment.student_id].append({
                        'class_id': cls._id,
                        'subject_id': cls.subject_id,
                        'term_id': cls.term_id,
                        'class_name': cls.class_name
                    })
        
            # Get homework and test assessment types
            homework_type = AssessmentTypeModel.query.filter_by(type_name='Homework').first()
            test_type = AssessmentTypeModel.query.filter_by(type_name='Test').first()
            
            homework_type_id = homework_type._id if homework_type else None
            test_type_id = test_type._id if test_type else None
        
            # Build student performance data
            students_data = []
            
            for student_id in student_ids:
                student = StudentModel.find_by_id(student_id)
                if not student:
                    continue
                
                # Get student's classes (for reference)
                student_classes = student_class_map[student_id]
                
                # Calculate metrics across all relevant classes
                # Use sets to avoid duplicate counting for assignments
                homework_assignments_seen = set()
                test_assignments_seen = set()
                attendance_records_seen = set()
                
                total_homework = 0
                completed_homework = 0
                total_tests = 0
                test_scores_sum = Decimal('0.00')
                test_scores_count = 0
                
                # Attendance tracking per subject
                subject_attendance = defaultdict(lambda: {'present': 0, 'total': 0})
                
                # Process each unique (subject_id, term_id) combination
                processed_combos = set()
                
                for class_info in student_classes:
                    cls_subject_id = class_info['subject_id']
                    cls_term_id = class_info['term_id']
                    cls_class_id = class_info['class_id']
                    
                    if not cls_subject_id or not cls_term_id:
                        continue
                    
                    # Skip if we've already processed this subject/term combo
                    combo_key = (str(cls_subject_id), str(cls_term_id))
                    if combo_key in processed_combos:
                        continue
                    processed_combos.add(combo_key)
                    
                    # Get homework assignments for this subject/term
                    if homework_type_id:
                        homework_assignments = AssignmentModel.query.filter_by(
                            subject_id=cls_subject_id,
                            term_id=cls_term_id,
                            assessment_type_id=homework_type_id,
                            status='published'
                        ).all()
                        
                        for hw in homework_assignments:
                            if str(hw._id) not in homework_assignments_seen:
                                homework_assignments_seen.add(str(hw._id))
                                total_homework += 1
                                sa = StudentAssignmentModel.query.filter_by(
                                    student_id=student_id,
                                    assignment_id=hw._id
                                ).first()
                                if sa and sa.status == 'graded':
                                    completed_homework += 1
                    
                    # Get test assignments for this subject/term
                    if test_type_id:
                        test_assignments = AssignmentModel.query.filter_by(
                            subject_id=cls_subject_id,
                            term_id=cls_term_id,
                            assessment_type_id=test_type_id,
                            status='published'
                        ).all()
                        
                        for test in test_assignments:
                            if str(test._id) not in test_assignments_seen:
                                test_assignments_seen.add(str(test._id))
                                total_tests += 1
                                sa = StudentAssignmentModel.query.filter_by(
                                    student_id=student_id,
                                    assignment_id=test._id
                                ).first()
                                if sa and sa.score is not None and sa.status == 'graded':
                                    # Calculate percentage score
                                    percentage = (Decimal(str(sa.score)) / Decimal(str(test.max_score))) * Decimal('100')
                                    test_scores_sum += percentage
                                    test_scores_count += 1
                    
                    # Get attendance records for this subject/term
                    # Get all classes for this term that match this subject
                    term_classes = ClassModel.query.filter_by(
                        term_id=cls_term_id,
                        subject_id=cls_subject_id
                    ).all()
                    term_class_ids = [c._id for c in term_classes]
                    
                    if term_class_ids:
                        attendance_records = AttendanceModel.query.filter(
                            AttendanceModel.student_id == student_id,
                            AttendanceModel.subject_id == cls_subject_id,
                            AttendanceModel.class_id.in_(term_class_ids)
                        ).all()
                        
                        for att in attendance_records:
                            att_key = f"{str(att._id)}"
                            if att_key not in attendance_records_seen:
                                attendance_records_seen.add(att_key)
                                subject_attendance[cls_subject_id]['total'] += 1
                                if att.status == 'present':
                                    subject_attendance[cls_subject_id]['present'] += 1
                
                # Calculate averages
                homework_completion_ratio = 0.0
                if total_homework > 0:
                    homework_completion_ratio = (completed_homework / total_homework) * 100
                
                test_average = 0.0
                if test_scores_count > 0:
                    test_average = float(test_scores_sum / Decimal(str(test_scores_count)))
                
                # Calculate overall attendance ratio (across all subjects)
                total_attendance_days = sum(s['total'] for s in subject_attendance.values())
                total_present_days = sum(s['present'] for s in subject_attendance.values())
                attendance_ratio = 0.0
                if total_attendance_days > 0:
                    attendance_ratio = (total_present_days / total_attendance_days) * 100
                
                # Get unique subjects for this student
                unique_subjects = set()
                for class_info in student_classes:
                    if class_info['subject_id']:
                        unique_subjects.add(class_info['subject_id'])
                
                subjects_list = []
                for subj_id in unique_subjects:
                    subject = SubjectModel.find_by_id(subj_id)
                    if subject:
                        subjects_list.append(subject.subject_name)
                
                # Get unique class names (deduplicate)
                unique_class_names = list(set([c['class_name'] for c in student_classes]))
                unique_class_names.sort()
                
                # Get term grades for this student (if term_id is provided)
                # If subject_id filter is provided, only get term grades for that subject
                # Otherwise, get term grades for all subjects the student is enrolled in
                term_grade_average = None
                term_grades = []
                if term_id:
                    # Determine which subjects to check for term grades
                    subjects_to_check = list(unique_subjects)
                    if subject_id:
                        # Only include the filtered subject if student is enrolled in it
                        if subject_id in [str(s) for s in unique_subjects]:
                            subjects_to_check = [subject_id]
                        else:
                            subjects_to_check = []
                    
                    # Get term grades for this student/subject/term
                    for subj_id in subjects_to_check:
                        term_grade = TermGradeModel.find_by_student_subject_term(
                            student_id, subj_id, term_id
                        )
                        if term_grade and term_grade.final_grade is not None:
                            term_grades.append(float(term_grade.final_grade))
                
                if term_grades:
                    term_grade_average = sum(term_grades) / len(term_grades)
                
                students_data.append({
                    'student_id': str(student._id),
                    'student_name': f"{student.given_name} {student.surname}",
                    'email': student.email or '',
                    'homework_completion_ratio': round(homework_completion_ratio, 1),
                    'homework_completed': completed_homework,
                    'homework_total': total_homework,
                    'attendance_ratio': round(attendance_ratio, 1),
                    'attendance_present': total_present_days,
                    'attendance_total': total_attendance_days,
                    'test_average': round(test_average, 1),
                    'test_count': test_scores_count,
                    'test_total': total_tests,
                    'term_grade_average': round(term_grade_average, 1) if term_grade_average is not None else None,
                    'subjects': subjects_list,
                    'classes': unique_class_names
                })
        
            # Sort by student name
            students_data.sort(key=lambda x: x['student_name'])
            
            # Collect all individual test scores for distribution (deduplicate by student+assignment)
            all_test_scores = []
            seen_test_scores = set()  # (student_id, assignment_id) tuples
            
            for student_id in student_ids:
                # Get all test assignments for filtered classes
                processed_combos = set()
                for class_info in student_class_map[student_id]:
                    cls_subject_id = class_info['subject_id']
                    cls_term_id = class_info['term_id']
                    
                    if not cls_subject_id or not cls_term_id or not test_type_id:
                        continue
                    
                    # Skip if we've already processed this subject/term combo
                    combo_key = (str(cls_subject_id), str(cls_term_id))
                    if combo_key in processed_combos:
                        continue
                    processed_combos.add(combo_key)
                    
                    test_assignments = AssignmentModel.query.filter_by(
                        subject_id=cls_subject_id,
                        term_id=cls_term_id,
                        assessment_type_id=test_type_id,
                        status='published'
                    ).all()
                    
                    for test in test_assignments:
                        score_key = (str(student_id), str(test._id))
                        if score_key in seen_test_scores:
                            continue
                        seen_test_scores.add(score_key)
                        
                        sa = StudentAssignmentModel.query.filter_by(
                            student_id=student_id,
                            assignment_id=test._id
                        ).first()
                        if sa and sa.score is not None and sa.status == 'graded':
                            # Calculate percentage score
                            percentage = (float(sa.score) / float(test.max_score)) * 100
                            all_test_scores.append(percentage)
            
            return {
                'success': True,
                'students': students_data,
                'count': len(students_data),
                'test_scores': all_test_scores  # Individual test scores for distribution
            }, 200
        except Exception as e:
            import logging
            import traceback
            logging.error(f"Error in TeacherStudentsResource.get: {str(e)}")
            logging.error(traceback.format_exc())
            return {
                'success': False,
                'message': f'Error fetching student data: {str(e)}'
            }, 500

