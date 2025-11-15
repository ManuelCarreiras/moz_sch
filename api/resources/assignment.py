from flask_restful import Resource
from flask import Response, request
from models.assignment import AssignmentModel
from models.subject import SubjectModel
from models.class_model import ClassModel
from models.assessment_type import AssessmentTypeModel
from models.term import TermModel
from models.teacher import TeacherModel
from models.student_class import StudentClassModel
from models.student_assignment import StudentAssignmentModel
from utils.auth_middleware import require_role, require_any_role
from flask import g
import json
from datetime import datetime


def create_student_assignments_for_class(assignment_id, class_name, subject_id, term_id):
    """
    Auto-create student_assignment records for all students enrolled in this class
    Matches students by class_name, subject_id, and term
    """
    try:
        # Get all class instances matching this class_name, subject_id, and term
        all_classes = ClassModel.query.filter_by(
            class_name=class_name,
            subject_id=subject_id,
            term_id=term_id
        ).all()
        
        if not all_classes:
            return
        
        # Get all unique students enrolled in any of these class instances
        student_ids = set()
        for class_obj in all_classes:
            enrollments = StudentClassModel.query.filter_by(class_id=class_obj._id).all()
            for enrollment in enrollments:
                student_ids.add(str(enrollment.student_id))
        
        # Create student_assignment record for each student
        for student_id in student_ids:
            # Check if record already exists
            existing = StudentAssignmentModel.find_by_student_and_assignment(student_id, assignment_id)
            if not existing:
                student_assignment = StudentAssignmentModel(
                    student_id=student_id,
                    assignment_id=assignment_id,
                    status='not_submitted'
                )
                student_assignment.save_to_db()
        
        return len(student_ids)
    except Exception as e:
        print(f"Error creating student assignments: {str(e)}")
        return 0


class AssignmentResource(Resource):
    """
    Assignment Resource - Manage assignments for classes
    """

    @require_any_role(['admin', 'teacher'])
    def get(self, assignment_id=None):
        """
        GET /assignment - Get all assignments (with filters)
        GET /assignment/<assignment_id> - Get specific assignment
        Query params: class_id, term_id, subject_id, status, teacher_id
        """
        if assignment_id:
            # Get specific assignment
            assignment = AssignmentModel.find_by_id(assignment_id)
            if not assignment:
                return {'message': 'Assignment not found'}, 404
            
            # Enhance assignment data with related information
            assignment_data = assignment.json()
            
            # Add assessment type info
            assessment_type = AssessmentTypeModel.find_by_id(assignment.assessment_type_id)
            if assessment_type:
                assignment_data['assessment_type_name'] = assessment_type.type_name
            
            # Add subject info
            subject = SubjectModel.find_by_id(assignment.subject_id)
            if subject:
                assignment_data['subject_name'] = subject.subject_name
            
            # Add class info
            class_obj = ClassModel.find_by_id(assignment.class_id)
            if class_obj:
                assignment_data['class_name'] = class_obj.class_name
            
            # Add term info
            term = TermModel.find_by_id(assignment.term_id)
            if term:
                assignment_data['term_number'] = term.term_number
            
            return {'assignment': assignment_data}, 200
        
        # Get all assignments with optional filters
        class_id = request.args.get('class_id')
        term_id = request.args.get('term_id')
        subject_id = request.args.get('subject_id')
        status = request.args.get('status')
        teacher_id = request.args.get('teacher_id')
        
        # Start with all assignments
        if class_id and term_id:
            assignments = AssignmentModel.find_by_class_and_term(class_id, term_id)
        elif class_id:
            assignments = AssignmentModel.find_by_class(class_id)
        elif term_id:
            assignments = AssignmentModel.find_by_term(term_id)
        elif teacher_id:
            assignments = AssignmentModel.find_by_teacher(teacher_id)
        elif status:
            assignments = AssignmentModel.find_by_status(status)
        else:
            assignments = AssignmentModel.find_all()
        
        # Apply additional filters
        if subject_id:
            assignments = [a for a in assignments if str(a.subject_id) == subject_id]
        if status and not request.args.get('status'):  # If status wasn't the primary filter
            assignments = [a for a in assignments if a.status == status]
        
        # Enhance each assignment with related info
        enhanced_assignments = []
        for assignment in assignments:
            assignment_data = assignment.json()
            
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
            
            # Add term
            term = TermModel.find_by_id(assignment.term_id)
            if term:
                assignment_data['term_number'] = term.term_number
            
            enhanced_assignments.append(assignment_data)
        
        return {
            'assignments': enhanced_assignments,
            'count': len(enhanced_assignments)
        }, 200

    @require_any_role(['admin', 'teacher'])
    def post(self):
        """
        POST /assignment - Create new assignment
        Teachers can only create assignments for their own classes
        """
        data = request.get_json()
        
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Required fields
        required_fields = ['title', 'subject_id', 'class_id', 'assessment_type_id', 'term_id']
        for field in required_fields:
            if field not in data:
                return {'message': f'{field} is required'}, 400
        
        # Get authenticated user
        username = g.username if hasattr(g, 'username') else None
        teacher = TeacherModel.find_by_username(username) if username else None
        
        # Validate references exist
        subject = SubjectModel.find_by_id(data['subject_id'])
        if not subject:
            return {'message': 'Subject not found'}, 404
        
        class_obj = ClassModel.find_by_id(data['class_id'])
        if not class_obj:
            return {'message': 'Class not found'}, 404
        
        assessment_type = AssessmentTypeModel.find_by_id(data['assessment_type_id'])
        if not assessment_type:
            return {'message': 'Assessment type not found'}, 404
        
        term = TermModel.find_by_id(data['term_id'])
        if not term:
            return {'message': 'Term not found'}, 404
        
        # Teachers can only create assignments for their own classes (admin can create for any)
        user_role = request.environ.get('user_role')
        if user_role == 'teacher' and teacher:
            if str(class_obj.teacher_id) != str(teacher._id):
                return {'message': 'You can only create assignments for your own classes'}, 403
        
        try:
            # Parse due_date if provided
            due_date = None
            if 'due_date' in data and data['due_date']:
                try:
                    due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                except:
                    return {'message': 'Invalid due_date format. Use ISO format.'}, 400
            
            new_assignment = AssignmentModel(
                title=data['title'],
                description=data.get('description'),
                subject_id=data['subject_id'],
                class_id=data['class_id'],
                assessment_type_id=data['assessment_type_id'],
                term_id=data['term_id'],
                due_date=due_date,
                max_score=data.get('max_score', 100.00),
                status=data.get('status', 'draft'),
                created_by=teacher._id if teacher else None
            )
            new_assignment.save_to_db()
            
            # Auto-create student_assignment records if status is 'published'
            students_created = 0
            if data.get('status') == 'published':
                students_created = create_student_assignments_for_class(
                    str(new_assignment._id),
                    class_obj.class_name,
                    data['subject_id'],
                    data['term_id']
                )
            
            response = {
                'success': True,
                'message': f'Assignment created successfully. {students_created} student records created.' if students_created > 0 else 'Assignment created successfully',
                'assignment': new_assignment.json(),
                'students_affected': students_created
            }
            return Response(json.dumps(response), 201, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error creating assignment: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'teacher'])
    def put(self):
        """
        PUT /assignment - Update assignment
        Teachers can only update their own assignments
        """
        data = request.get_json()
        
        if not data or '_id' not in data:
            return {'message': 'Assignment ID is required'}, 400
        
        assignment = AssignmentModel.find_by_id(data['_id'])
        
        if not assignment:
            return {'message': 'Assignment not found'}, 404
        
        # Get authenticated user
        username = g.username if hasattr(g, 'username') else None
        teacher = TeacherModel.find_by_username(username) if username else None
        
        # Teachers can only update their own assignments (admin can update any)
        user_role = g.role if hasattr(g, 'role') else None
        if user_role == 'teacher' and teacher:
            if assignment.created_by and str(assignment.created_by) != str(teacher._id):
                return {'message': 'You can only update your own assignments'}, 403
        
        try:
            # Track if status is changing to 'published'
            old_status = assignment.status
            status_changed_to_published = False
            
            # Update fields
            if 'title' in data:
                assignment.title = data['title']
            if 'description' in data:
                assignment.description = data['description']
            if 'due_date' in data:
                if data['due_date']:
                    try:
                        assignment.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                    except:
                        return {'message': 'Invalid due_date format'}, 400
                else:
                    assignment.due_date = None
            if 'max_score' in data:
                assignment.max_score = data['max_score']
            if 'status' in data:
                assignment.status = data['status']
                if old_status != 'published' and data['status'] == 'published':
                    status_changed_to_published = True
            
            assignment.save_to_db()
            
            # Auto-create student assignments if newly published
            students_created = 0
            if status_changed_to_published:
                class_obj = ClassModel.find_by_id(assignment.class_id)
                if class_obj:
                    students_created = create_student_assignments_for_class(
                        str(assignment._id),
                        class_obj.class_name,
                        str(assignment.subject_id),
                        str(assignment.term_id)
                    )
            
            response = {
                'success': True,
                'message': f'Assignment updated successfully. {students_created} student records created.' if students_created > 0 else 'Assignment updated successfully',
                'assignment': assignment.json(),
                'students_affected': students_created
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error updating assignment: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'teacher'])
    def delete(self, assignment_id):
        """
        DELETE /assignment/<assignment_id> - Delete assignment
        Teachers can only delete their own assignments
        """
        assignment = AssignmentModel.find_by_id(assignment_id)
        
        if not assignment:
            return {'message': 'Assignment not found'}, 404
        
        # Get authenticated user
        username = g.username if hasattr(g, 'username') else None
        teacher = TeacherModel.find_by_username(username) if username else None
        
        # Teachers can only delete their own assignments (admin can delete any)
        user_role = g.role if hasattr(g, 'role') else None
        if user_role == 'teacher' and teacher:
            if assignment.created_by and str(assignment.created_by) != str(teacher._id):
                return {'message': 'You can only delete your own assignments'}, 403
        
        try:
            assignment.delete_from_db()
            response = {
                'success': True,
                'message': 'Assignment deleted successfully'
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting assignment: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')


class TeacherAssignmentResource(Resource):
    """
    Teacher Assignment Resource - Get assignments for authenticated teacher or admin
    """

    @require_any_role(['admin', 'teacher'])
    def get(self):
        """
        GET /assignment/teacher - Get all assignments for authenticated teacher or admin
        """
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        
        if not username:
            return {'message': 'Authentication required'}, 401
        
        # If admin, return all assignments
        if user_role == 'admin':
            assignments = AssignmentModel.find_all()
        else:
            # If teacher, return only their assignments
            teacher = TeacherModel.find_by_username(username)
            if not teacher:
                return {'message': 'Teacher not found'}, 404
            assignments = AssignmentModel.find_by_teacher(teacher._id)
        
        # Enhance each assignment with related info
        enhanced_assignments = []
        for assignment in assignments:
            assignment_data = assignment.json()
            
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
            
            # Add term
            term = TermModel.find_by_id(assignment.term_id)
            if term:
                assignment_data['term_number'] = term.term_number
            
            enhanced_assignments.append(assignment_data)
        
        return {
            'assignments': enhanced_assignments,
            'count': len(enhanced_assignments)
        }, 200

