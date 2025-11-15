from flask import request, Response, g
from flask_restful import Resource
from models.student import StudentModel
from models.class_model import ClassModel
from models.student_class import StudentClassModel
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


class StudentOverviewResource(Resource):
    """
    Get student's own performance metrics and class test score distribution
    """

    @require_any_role(['admin', 'student'])
    def get(self):
        """
        GET /student/overview?year_id=&term_id=&subject_id=&class_name=
        Returns:
        - Student's own metrics (homework completion, attendance, test average, term grade)
        - Class test scores (for distribution visualization)
        - Student's position in class distribution
        """
        try:
            username = g.username if hasattr(g, 'username') else None
            user_role = g.role if hasattr(g, 'role') else None
            
            if not username:
                return {'message': 'Authentication required'}, 401
            
            # Get student_id - either from request param (for admin) or from authenticated user (for student)
            requested_student_id = request.args.get('student_id')
            
            if user_role == 'admin' and requested_student_id:
                # Admin viewing a specific student
                student = StudentModel.find_by_id(requested_student_id)
                if not student:
                    return {'message': 'Student not found'}, 404
                student_id = str(student._id)
            elif user_role == 'student':
                # Student viewing their own data
                student = StudentModel.find_by_username(username)
                if not student:
                    return {'message': 'Student not found'}, 404
                student_id = str(student._id)
            else:
                return {'message': 'Invalid access. Student role required or student_id parameter needed for admin.'}, 403
            
            # Get filters
            year_id = request.args.get('year_id')
            term_id = request.args.get('term_id')
            subject_id = request.args.get('subject_id')
            class_name = request.args.get('class_name')
            
            # Get student's classes
            student_enrollments = StudentClassModel.find_by_student_id(student_id)
            
            if not student_enrollments:
                return {
                    'success': True,
                    'student_metrics': {
                        'homework_completion_ratio': 0,
                        'attendance_ratio': 0,
                        'test_average': 0,
                        'term_grade_average': None
                    },
                    'class_test_scores': [],
                    'student_test_scores': [],
                    'student_position': None
                }, 200
            
            # Filter classes based on filters
            filtered_classes = []
            for enrollment in student_enrollments:
                class_obj = ClassModel.find_by_id(enrollment.class_id)
                if not class_obj:
                    continue
                
                # Apply filters
                if year_id:
                    term = TermModel.find_by_id(class_obj.term_id)
                    if not term or str(term.year_id) != str(year_id):
                        continue
                if term_id and str(class_obj.term_id) != str(term_id):
                    continue
                if subject_id and str(class_obj.subject_id) != str(subject_id):
                    continue
                if class_name and class_obj.class_name != class_name:
                    continue
                
                filtered_classes.append(class_obj)
            
            if not filtered_classes:
                return {
                    'success': True,
                    'student_metrics': {
                        'homework_completion_ratio': 0,
                        'attendance_ratio': 0,
                        'test_average': 0,
                        'term_grade_average': None
                    },
                    'class_test_scores': [],
                    'student_test_scores': [],
                    'student_position': None
                }, 200
            
            # Get homework and test assessment types
            homework_type = AssessmentTypeModel.query.filter_by(type_name='Homework').first()
            test_type = AssessmentTypeModel.query.filter_by(type_name='Test').first()
            
            homework_type_id = homework_type._id if homework_type else None
            test_type_id = test_type._id if test_type else None
            
            # Calculate student's own metrics
            homework_assignments_seen = set()
            test_assignments_seen = set()
            attendance_records_seen = set()
            
            total_homework = 0
            completed_homework = 0
            total_tests = 0
            test_scores_sum = Decimal('0.00')
            test_scores_count = 0
            student_test_scores = []  # Individual test scores for this student
            
            # Attendance tracking
            subject_attendance = defaultdict(lambda: {'present': 0, 'total': 0})
            
            # Process each class
            for class_obj in filtered_classes:
                # Get assignments for this class
                assignments = AssignmentModel.find_by_class(class_obj._id)
                
                for assignment in assignments:
                    # Homework assignments
                    if homework_type_id and str(assignment.assessment_type_id) == str(homework_type_id):
                        assignment_key = (str(assignment._id), str(class_obj.subject_id), str(class_obj.term_id))
                        if assignment_key not in homework_assignments_seen:
                            homework_assignments_seen.add(assignment_key)
                            total_homework += 1
                            
                            # Check if student completed it
                            sa = StudentAssignmentModel.find_by_student_and_assignment(student_id, assignment._id)
                            if sa and sa.status == 'graded':
                                completed_homework += 1
                    
                    # Test assignments
                    if test_type_id and str(assignment.assessment_type_id) == str(test_type_id):
                        assignment_key = (str(assignment._id), str(class_obj.subject_id), str(class_obj.term_id))
                        if assignment_key not in test_assignments_seen:
                            test_assignments_seen.add(assignment_key)
                            total_tests += 1
                            
                            # Get student's test score
                            sa = StudentAssignmentModel.find_by_student_and_assignment(student_id, assignment._id)
                            if sa and sa.score is not None and sa.status == 'graded':
                                percentage = float((Decimal(str(sa.score)) / Decimal(str(assignment.max_score))) * 100)
                                test_scores_sum += Decimal(str(percentage))
                                test_scores_count += 1
                                student_test_scores.append(percentage)
                
                # Get attendance for this class/subject
                all_attendance = AttendanceModel.find_by_student_id(student_id)
                for record in all_attendance:
                    # Filter by subject and check if it's for this class/term
                    if record.subject_id and str(record.subject_id) == str(class_obj.subject_id):
                        record_key = (str(record._id), str(class_obj.subject_id), str(class_obj.term_id))
                        if record_key not in attendance_records_seen:
                            attendance_records_seen.add(record_key)
                            subject_attendance[class_obj.subject_id]['total'] += 1
                            if record.status == 'present':
                                subject_attendance[class_obj.subject_id]['present'] += 1
            
            # Calculate student metrics
            homework_completion_ratio = (completed_homework / total_homework * 100) if total_homework > 0 else 0
            test_average = float(test_scores_sum / Decimal(str(test_scores_count))) if test_scores_count > 0 else 0
            
            # Calculate attendance ratio (average across all subjects)
            total_present = sum(att['present'] for att in subject_attendance.values())
            total_attendance = sum(att['total'] for att in subject_attendance.values())
            attendance_ratio = (total_present / total_attendance * 100) if total_attendance > 0 else 0
            
            # Get term grade average (if term_id is provided)
            term_grade_average = None
            if term_id:
                term_grades = []
                for class_obj in filtered_classes:
                    term_grade = TermGradeModel.find_by_student_subject_term(
                        student_id, str(class_obj.subject_id), term_id
                    )
                    if term_grade and term_grade.final_grade is not None:
                        term_grades.append(float(term_grade.final_grade))
                
                if term_grades:
                    term_grade_average = sum(term_grades) / len(term_grades)
            
            # Get class test scores (all students in the same classes)
            class_test_scores = []
            all_student_ids = set()
            
            for class_obj in filtered_classes:
                enrollments = StudentClassModel.find_by_class_id(class_obj._id)
                for enrollment in enrollments:
                    all_student_ids.add(enrollment.student_id)
            
            # Get test scores for all students in these classes
            for other_student_id in all_student_ids:
                if str(other_student_id) == student_id:
                    continue  # Skip the current student
                
                for class_obj in filtered_classes:
                    assignments = AssignmentModel.find_by_class(class_obj._id)
                    for assignment in assignments:
                        if test_type_id and str(assignment.assessment_type_id) == str(test_type_id):
                            sa = StudentAssignmentModel.find_by_student_and_assignment(
                                str(other_student_id), assignment._id
                            )
                            if sa and sa.score is not None and sa.status == 'graded':
                                percentage = float((Decimal(str(sa.score)) / Decimal(str(assignment.max_score))) * 100)
                                class_test_scores.append(percentage)
            
            # Calculate student's position in class test score distribution
            student_position = None
            if class_test_scores and student_test_scores:
                # Use student's average test score
                student_avg = test_average
                # Count how many students scored higher
                students_above = sum(1 for score in class_test_scores if score > student_avg)
                total_students = len(class_test_scores) + 1  # +1 for the current student
                student_position = {
                    'percentile': ((total_students - students_above) / total_students * 100) if total_students > 0 else 0,
                    'rank': students_above + 1,
                    'total_students': total_students,
                    'student_average': student_avg
                }
            
            # Get class term grades (all students in the same classes)
            class_term_grades = []
            student_term_grades_list = []
            
            # Get term grades for all students in these classes (if term_id is provided)
            if term_id:
                for class_obj in filtered_classes:
                    # Get all students in this class
                    enrollments = StudentClassModel.find_by_class_id(class_obj._id)
                    for enrollment in enrollments:
                        other_student_id = enrollment.student_id
                        # Get term grade for this student/subject/term
                        term_grade = TermGradeModel.find_by_student_subject_term(
                            str(other_student_id), str(class_obj.subject_id), term_id
                        )
                        if term_grade and term_grade.final_grade is not None:
                            grade_value = float(term_grade.final_grade)
                            if str(other_student_id) == student_id:
                                student_term_grades_list.append(grade_value)
                            else:
                                class_term_grades.append(grade_value)
            
            # Calculate student's position in class term grade distribution (0-20 scale)
            term_grade_position = None
            if term_grade_average is not None and class_term_grades:
                # Use student's average term grade
                student_term_avg = term_grade_average
                # Count how many students scored higher
                students_above_term = sum(1 for grade in class_term_grades if grade > student_term_avg)
                total_students_term = len(class_term_grades) + 1  # +1 for the current student
                term_grade_position = {
                    'percentile': ((total_students_term - students_above_term) / total_students_term * 100) if total_students_term > 0 else 0,
                    'rank': students_above_term + 1,
                    'total_students': total_students_term,
                    'student_grade': student_term_avg
                }
            
            response = {
                'success': True,
                'student_metrics': {
                    'homework_completion_ratio': round(homework_completion_ratio, 1),
                    'attendance_ratio': round(attendance_ratio, 1),
                    'test_average': round(test_average, 1),
                    'term_grade_average': round(term_grade_average, 1) if term_grade_average is not None else None
                },
                'class_test_scores': class_test_scores,
                'student_test_scores': student_test_scores,
                'student_position': student_position,
                'class_term_grades': class_term_grades,
                'student_term_grades': student_term_grades_list,
                'term_grade_position': term_grade_position
            }
            
            return response, 200
            
        except Exception as e:
            import logging
            logging.error(f"Error in StudentOverviewResource.get: {str(e)}")
            return {'message': f'Error: {str(e)}'}, 500

