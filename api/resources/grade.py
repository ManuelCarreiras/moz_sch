from flask_restful import Resource
from flask import Response, request
from models.student_assignment import StudentAssignmentModel
from models.assignment import AssignmentModel
from models.student import StudentModel
from models.student_year_grade import StudentYearGradeModel
from models.class_model import ClassModel
from models.subject import SubjectModel
from models.score_range import ScoreRangeModel
from models.teacher import TeacherModel
from models.assessment_type import AssessmentTypeModel
from utils.auth_middleware import require_role, require_any_role
from flask import g
import json
from datetime import datetime
from decimal import Decimal


class GradeResource(Resource):
    """
    Grade Resource - Manage student grades for assignments
    """

    @require_any_role(['admin', 'teacher', 'student', 'secretary'])
    def get(self, grade_id=None):
        """
        GET /grade/<grade_id> - Get specific grade
        GET /grade?assignment_id=X - Get all grades for assignment
        GET /grade?student_id=X - Get all grades for student
        """
        if grade_id:
            # Get specific grade
            grade = StudentAssignmentModel.find_by_id(grade_id)
            if not grade:
                return {'message': 'Grade not found'}, 404
            
            # Check permissions
            username = g.username if hasattr(g, 'username') else None
            user_role = g.role if hasattr(g, 'role') else None
            
            if user_role == 'student':
                student = StudentModel.find_by_username(username) if username else None
                if not student or str(grade.student_id) != str(student._id):
                    return {'message': 'Access denied'}, 403
            
            return {'grade': grade.json()}, 200
        
        # Get grades with filters
        assignment_id = request.args.get('assignment_id')
        student_id = request.args.get('student_id')
        
        if assignment_id:
            grades = StudentAssignmentModel.find_by_assignment(assignment_id)
            
            # Enhance with student info
            enhanced_grades = []
            for grade in grades:
                grade_data = grade.json()
                student = StudentModel.find_by_id(grade.student_id)
                if student:
                    grade_data['student_name'] = f"{student.given_name} {student.surname}"
                enhanced_grades.append(grade_data)
            
            return {'grades': enhanced_grades, 'count': len(enhanced_grades)}, 200
        
        elif student_id:
            # Check permissions - students can only see their own grades
            username = g.username if hasattr(g, 'username') else None
            user_role = g.role if hasattr(g, 'role') else None
            
            if user_role == 'student':
                student = StudentModel.find_by_username(username) if username else None
                if not student or str(student._id) != student_id:
                    return {'message': 'Access denied'}, 403
            
            grades = StudentAssignmentModel.find_by_student(student_id)
            
            # Enhance with assignment info
            enhanced_grades = []
            for grade in grades:
                grade_data = grade.json()
                assignment = AssignmentModel.find_by_id(grade.assignment_id)
                if assignment:
                    grade_data['assignment_title'] = assignment.title
                    grade_data['max_score'] = float(assignment.max_score) if assignment.max_score else 100.00
                enhanced_grades.append(grade_data)
            
            return {'grades': enhanced_grades, 'count': len(enhanced_grades)}, 200
        
        return {'message': 'Please provide assignment_id or student_id'}, 400

    @require_any_role(['admin', 'teacher'])
    def post(self):
        """
        POST /grade - Create or update student grade
        """
        data = request.get_json()
        
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Required fields
        if 'student_id' not in data or 'assignment_id' not in data:
            return {'message': 'student_id and assignment_id are required'}, 400
        
        # Validate references
        student = StudentModel.find_by_id(data['student_id'])
        if not student:
            return {'message': 'Student not found'}, 404
        
        assignment = AssignmentModel.find_by_id(data['assignment_id'])
        if not assignment:
            return {'message': 'Assignment not found'}, 404
        
        # Teachers can only grade assignments they created (admin can grade any)
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        if user_role == 'teacher':
            teacher = TeacherModel.find_by_username(username) if username else None
            if teacher and assignment.created_by and str(assignment.created_by) != str(teacher._id):
                return {'message': 'You can only grade your own assignments'}, 403
        
        try:
            # Check if grade already exists
            existing_grade = StudentAssignmentModel.find_by_student_and_assignment(
                data['student_id'], data['assignment_id']
            )
            
            if existing_grade:
                # Update existing grade
                if 'score' in data:
                    existing_grade.score = data['score']
                if 'feedback' in data:
                    existing_grade.feedback = data['feedback']
                if 'status' in data:
                    existing_grade.status = data['status']
                
                # Set graded_date if score was provided and status is graded
                if 'score' in data and data.get('status') == 'graded':
                    existing_grade.graded_date = datetime.now()
                
                existing_grade.save_to_db()
                
                # Recalculate year grade
                self._recalculate_year_grade(data['student_id'], assignment.subject_id)
                
                # Recalculate term grade
                self._recalculate_term_grade(data['student_id'], assignment.subject_id, assignment.term_id, assignment.class_id)
                
                response = {
                    'success': True,
                    'message': 'Grade updated successfully',
                    'grade': existing_grade.json()
                }
                return Response(json.dumps(response), 200, mimetype='application/json')
            
            else:
                # Create new grade
                submission_date = None
                if 'submission_date' in data and data['submission_date']:
                    try:
                        submission_date = datetime.fromisoformat(data['submission_date'].replace('Z', '+00:00'))
                    except:
                        pass
                
                graded_date = None
                if 'score' in data and data.get('status') == 'graded':
                    graded_date = datetime.now()
                
                new_grade = StudentAssignmentModel(
                    student_id=data['student_id'],
                    assignment_id=data['assignment_id'],
                    score=data.get('score'),
                    submission_date=submission_date,
                    graded_date=graded_date,
                    feedback=data.get('feedback'),
                    status=data.get('status', 'not_submitted')
                )
                new_grade.save_to_db()
                
                # Recalculate year grade
                self._recalculate_year_grade(data['student_id'], assignment.subject_id)
                
                # Recalculate term grade
                self._recalculate_term_grade(data['student_id'], assignment.subject_id, assignment.term_id, assignment.class_id)
                
                response = {
                    'success': True,
                    'message': 'Grade created successfully',
                    'grade': new_grade.json()
                }
                return Response(json.dumps(response), 201, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error saving grade: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'teacher'])
    def delete(self, grade_id):
        """
        DELETE /grade/<grade_id> - Delete grade
        """
        grade = StudentAssignmentModel.find_by_id(grade_id)
        
        if not grade:
            return {'message': 'Grade not found'}, 404
        
        # Get assignment to check permissions
        assignment = AssignmentModel.find_by_id(grade.assignment_id)
        if not assignment:
            return {'message': 'Assignment not found'}, 404
        
        # Teachers can only delete grades for their own assignments
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        if user_role == 'teacher':
            teacher = TeacherModel.find_by_username(username) if username else None
            if teacher and assignment.created_by and str(assignment.created_by) != str(teacher._id):
                return {'message': 'You can only delete grades for your own assignments'}, 403
        
        try:
            student_id = grade.student_id
            subject_id = assignment.subject_id
            
            grade.delete_from_db()
            
            # Recalculate year grade
            self._recalculate_year_grade(student_id, subject_id)
            
            # Recalculate term grade
            self._recalculate_term_grade(student_id, subject_id, assignment.term_id, assignment.class_id)
            
            response = {
                'success': True,
                'message': 'Grade deleted successfully'
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting grade: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    def _recalculate_year_grade(self, student_id, subject_id):
        """
        Recalculate and cache the student's year grade (0-20 scale)
        Aggregates all graded assignments for this student in this subject across all terms in the current year
        """
        try:
            from models.term import TermModel
            from models.school_year import SchoolYearModel
            
            # Get all assignments for this student's subject across all their classes
            all_grades = StudentAssignmentModel.find_by_student(student_id)
            
            # Filter to only grades for this subject and get the year
            subject_assignments = []
            year_id = None
            
            for grade_record in all_grades:
                assignment = AssignmentModel.find_by_id(grade_record.assignment_id)
                if assignment and str(assignment.subject_id) == str(subject_id) and assignment.status == 'published':
                    # Get the year from the term
                    if not year_id:
                        term = TermModel.find_by_id(assignment.term_id)
                        if term:
                            year_id = term.year_id
                    
                    subject_assignments.append((assignment, grade_record))
            
            if not subject_assignments or not year_id:
                return
            
            # Calculate simple average on 0-100 scale first
            total_percentage = Decimal('0.00')
            count = 0
            
            for assignment, grade_record in subject_assignments:
                if grade_record.score is not None and grade_record.status == 'graded':
                    # Calculate percentage (0-100)
                    percentage = (Decimal(str(grade_record.score)) / Decimal(str(assignment.max_score))) * Decimal('100')
                    total_percentage += percentage
                    count += 1
            
            # Calculate final average
            if count > 0:
                # Simple average on 0-100 scale
                average_100 = total_percentage / count
                
                # Convert to 0-20 scale
                average_20 = (average_100 / Decimal('100')) * Decimal('20')
                average_20 = round(average_20, 2)
                
                # Update or create cached year grade
                cached_grade = StudentYearGradeModel.find_by_student_subject_year(
                    student_id, subject_id, year_id
                )
                
                if cached_grade:
                    cached_grade.calculated_average = average_20
                    cached_grade.save_to_db()
                else:
                    new_cached_grade = StudentYearGradeModel(
                        student_id=student_id,
                        subject_id=subject_id,
                        year_id=year_id,
                        calculated_average=average_20
                    )
                    new_cached_grade.save_to_db()
        
        except Exception as e:
            print(f"Error recalculating year grade: {e}")

    def _recalculate_term_grade(self, student_id, subject_id, term_id, class_id=None):
        """
        Recalculate and save the student's term grade automatically
        Uses grading_criteria to pull from student_assignment and attendance
        """
        try:
            from models.term_grade import TermGradeModel
            
            # Calculate and save term grade from grading criteria
            TermGradeModel.calculate_and_save(
                student_id=student_id,
                subject_id=subject_id,
                term_id=term_id,
                class_id=class_id
            )
        
        except Exception as e:
            print(f"Error recalculating term grade: {e}")


class GradebookResource(Resource):
    """
    Gradebook Resource - Get spreadsheet view for a class
    """

    @require_any_role(['admin', 'teacher'])
    def get(self, class_id):
        """
        GET /gradebook/class/<class_id> - Get gradebook for a class
        Returns: students (rows) × assignments (columns) grid
        """
        class_obj = ClassModel.find_by_id(class_id)
        if not class_obj:
            return {'message': 'Class not found'}, 404
        
        term_id = request.args.get('term_id')
        
        # Get assignments for this class
        if term_id:
            assignments = AssignmentModel.find_by_class_and_term(class_id, term_id)
        else:
            assignments = AssignmentModel.find_by_class(class_id)
        
        # Only show published assignments
        assignments = [a for a in assignments if a.status == 'published']
        
        # Get students enrolled in this class
        from models.student_class import StudentClassModel
        enrollments = StudentClassModel.find_by_class_id(class_id)
        student_ids = [e.student_id for e in enrollments]
        
        students = [StudentModel.find_by_id(sid) for sid in student_ids]
        students = [s for s in students if s]  # Remove None values
        
        # Build gradebook grid
        gradebook = []
        for student in students:
            student_row = {
                'student_id': str(student._id),
                'student_name': f"{student.given_name} {student.surname}",
                'grades': []
            }
            
            for assignment in assignments:
                grade = StudentAssignmentModel.find_by_student_and_assignment(
                    student._id, assignment._id
                )
                
                if grade:
                    grade_data = {
                        'assignment_id': str(assignment._id),
                        'score': float(grade.score) if grade.score is not None else None,
                        'status': grade.status,
                        'grade_id': str(grade._id)
                    }
                else:
                    grade_data = {
                        'assignment_id': str(assignment._id),
                        'score': None,
                        'status': 'not_submitted',
                        'grade_id': None
                    }
                
                student_row['grades'].append(grade_data)
            
            # Get cached year average if available (0-20 scale)
            from models.term import TermModel
            year_id = None
            if assignments and len(assignments) > 0:
                first_term = TermModel.find_by_id(assignments[0].term_id)
                if first_term:
                    year_id = first_term.year_id
            
            class_obj = ClassModel.find_by_id(class_id)
            if class_obj and year_id:
                cached_grade = StudentYearGradeModel.find_by_student_subject_year(
                    student._id, class_obj.subject_id, year_id
                )
                if cached_grade:
                    student_row['year_average'] = float(cached_grade.calculated_average) if cached_grade.calculated_average else None
                else:
                    student_row['year_average'] = None
            else:
                student_row['year_average'] = None
            
            gradebook.append(student_row)
        
        # Build assignment headers
        assignment_headers = []
        for assignment in assignments:
            # Get assessment type to check if scored
            assessment_type = AssessmentTypeModel.find_by_id(assignment.assessment_type_id)
            
            assignment_headers.append({
                '_id': str(assignment._id),
                'title': assignment.title,
                'max_score': float(assignment.max_score) if assignment.max_score else 100.00,
                'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
                'assessment_type_name': assessment_type.type_name if assessment_type else None,
                'is_scored': assessment_type.is_scored if assessment_type else True
            })
        
        return {
            'class_id': str(class_id),
            'class_name': class_obj.class_name,
            'assignments': assignment_headers,
            'students': gradebook,
            'student_count': len(gradebook),
            'assignment_count': len(assignments)
        }, 200

