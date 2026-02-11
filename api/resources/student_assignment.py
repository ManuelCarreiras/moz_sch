from flask_restful import Resource
from flask import Response, request, g
from models.student_assignment import StudentAssignmentModel
from models.assignment import AssignmentModel
from models.student import StudentModel
from models.class_model import ClassModel
from models.subject import SubjectModel
from models.assessment_type import AssessmentTypeModel
from models.term import TermModel
from models.school_year import SchoolYearModel
from utils.auth_middleware import require_any_role, require_role
import json
from datetime import datetime


class StudentAssignmentResource(Resource):
    """
    Student Assignment Resource - View assignments for authenticated student
    """

    @require_any_role(['admin', 'student', 'secretary'])
    def get(self, student_id=None):
        """
        GET /student/assignments - Get all assignments for authenticated student
        GET /student_assignment (admin/secretary) - Get all student assignments
        Optional filters: term_id, subject_id, status, year_id, class_name
        """
        # Check if admin/secretary is requesting all student assignments
        role = g.role if hasattr(g, 'role') else None
        
        if role in ['admin', 'secretary'] and not student_id:
            # Admin viewing all student assignments
            class_name_filter = request.args.get('class_name')
            term_id = request.args.get('term_id')
            subject_id = request.args.get('subject_id')
            status_filter = request.args.get('status')
            year_id = request.args.get('year_id')
            
            # Get all student assignments
            all_student_assignments = StudentAssignmentModel.query.all()
            
            # Enhance with details
            enhanced_assignments = []
            for sa in all_student_assignments:
                assignment = AssignmentModel.find_by_id(sa.assignment_id)
                if not assignment:
                    continue
                
                # Apply filters
                if term_id and str(assignment.term_id) != term_id:
                    continue
                if subject_id and str(assignment.subject_id) != subject_id:
                    continue
                if status_filter and sa.status != status_filter:
                    continue
                
                # Get class for class_name filter
                class_obj = ClassModel.find_by_id(assignment.class_id)
                if class_name_filter and (not class_obj or class_obj.class_name != class_name_filter):
                    continue
                
                # Get term and year info for year filtering
                term = TermModel.find_by_id(assignment.term_id)
                if year_id and term:
                    if str(term.year_id) != year_id:
                        continue
                
                # Build enhanced data
                assignment_data = sa.json()
                assignment_data['assignment'] = assignment.json()
                
                # Add student name
                student = StudentModel.find_by_id(sa.student_id)
                if student:
                    assignment_data['student_name'] = f"{student.given_name} {student.surname}"
                
                # Add assessment type
                assessment_type = AssessmentTypeModel.find_by_id(assignment.assessment_type_id)
                if assessment_type:
                    assignment_data['assessment_type_name'] = assessment_type.type_name
                
                # Add subject
                subject = SubjectModel.find_by_id(assignment.subject_id)
                if subject:
                    assignment_data['subject_name'] = subject.subject_name
                
                # Add class
                if class_obj:
                    assignment_data['class_name'] = class_obj.class_name
                
                # Add term and year info
                if term:
                    assignment_data['term_number'] = term.term_number
                    year = SchoolYearModel.find_by_id(term.year_id)
                    if year:
                        assignment_data['year_name'] = year.year_name
                        assignment_data['year_id'] = str(year._id)
                
                enhanced_assignments.append(assignment_data)
            
            # Sort by due date
            enhanced_assignments.sort(key=lambda x: x['assignment'].get('due_date') or '9999-12-31')
            
            return {
                'success': True,
                'assignments': enhanced_assignments,
                'count': len(enhanced_assignments)
            }, 200
        
        # Get authenticated student
        if not student_id:
            username = g.username if hasattr(g, 'username') else None
            if not username:
                return {'message': 'Authentication required'}, 401
            
            student = StudentModel.find_by_username(username)
            if not student:
                return {'message': 'Student not found'}, 404
            student_id = str(student._id)
        
        # Get query parameters for filtering
        term_id = request.args.get('term_id')
        subject_id = request.args.get('subject_id')
        status_filter = request.args.get('status')
        year_id = request.args.get('year_id')
        
        # Get all student_assignment records for this student
        student_assignments = StudentAssignmentModel.find_by_student(student_id)
        
        # Enhance with assignment details
        enhanced_assignments = []
        for sa in student_assignments:
            assignment = AssignmentModel.find_by_id(sa.assignment_id)
            if not assignment:
                continue
            
            # Apply filters
            if term_id and str(assignment.term_id) != term_id:
                continue
            if subject_id and str(assignment.subject_id) != subject_id:
                continue
            if status_filter and sa.status != status_filter:
                continue
            
            # Get term and year info for year filtering
            term = TermModel.find_by_id(assignment.term_id)
            if year_id and term:
                if str(term.year_id) != year_id:
                    continue
            
            # Build enhanced data
            assignment_data = sa.json()
            assignment_data['assignment'] = assignment.json()
            
            # Add assessment type
            assessment_type = AssessmentTypeModel.find_by_id(assignment.assessment_type_id)
            if assessment_type:
                assignment_data['assessment_type_name'] = assessment_type.type_name
            
            # Add subject
            subject = SubjectModel.find_by_id(assignment.subject_id)
            if subject:
                assignment_data['subject_name'] = subject.subject_name
            
            # Add class
            class_obj = ClassModel.find_by_id(assignment.class_id)
            if class_obj:
                assignment_data['class_name'] = class_obj.class_name
            
            # Add term and year info
            if term:
                assignment_data['term_number'] = term.term_number
                year = SchoolYearModel.find_by_id(term.year_id)
                if year:
                    assignment_data['year_name'] = year.year_name
                    assignment_data['year_id'] = str(year._id)
            
            enhanced_assignments.append(assignment_data)
        
        # Sort by due date (upcoming first)
        enhanced_assignments.sort(key=lambda x: x['assignment'].get('due_date') or '9999-12-31')
        
        return {
            'success': True,
            'assignments': enhanced_assignments,
            'count': len(enhanced_assignments)
        }, 200

