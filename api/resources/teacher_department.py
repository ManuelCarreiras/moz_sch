from flask import request, Response
from flask_restful import Resource
from models.teacher_department import TeacherDepartmentModel
from models.teacher import TeacherModel
from models.department import DepartmentModel
from db import db
import json
from uuid import UUID


class TeacherDepartmentResource(Resource):
    def post(self):
        data = request.get_json()

        if not data.get('teacher_id') or not data.get('department_id'):
            response = {
                'success': False,
                'message': 'Missing required fields: teacher_id and department_id'
            }
            return Response(json.dumps(response), 400)

        # Check if teacher exists
        teacher = TeacherModel.find_by_id(UUID(data['teacher_id']))
        if not teacher:
            response = {
                'success': False,
                'message': 'Teacher not found'
            }
            return Response(json.dumps(response), 404)

        # Check if department exists
        department = DepartmentModel.find_by_id(UUID(data['department_id']))
        if not department:
            response = {
                'success': False,
                'message': 'Department not found'
            }
            return Response(json.dumps(response), 404)

        # Check if assignment already exists
        existing_assignment = TeacherDepartmentModel.find_by_teacher_and_department(
            UUID(data['teacher_id']), UUID(data['department_id'])
        )
        if existing_assignment:
            response = {
                'success': False,
                'message': 'Teacher is already assigned to this department'
            }
            return Response(json.dumps(response), 400)

        # Create new assignment
        new_assignment = TeacherDepartmentModel(
            teacher_id=UUID(data['teacher_id']),
            department_id=UUID(data['department_id'])
        )
        new_assignment.save_to_db()

        response = {
            'success': True,
            'message': new_assignment.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, teacher_id=None, department_id=None):
        if teacher_id:
            # Get all departments for a specific teacher
            assignments = TeacherDepartmentModel.find_by_teacher_id(UUID(teacher_id))
            departments = []
            for assignment in assignments:
                department = DepartmentModel.find_by_id(assignment.department_id)
                if department:
                    departments.append(department.json())
            
            response = {
                'success': True,
                'message': departments
            }
            return Response(json.dumps(response), 200)
        elif department_id:
            # Get all teachers for a specific department
            assignments = TeacherDepartmentModel.find_by_department_id(UUID(department_id))
            teachers = []
            for assignment in assignments:
                teacher = TeacherModel.find_by_id(assignment.teacher_id)
                if teacher:
                    teacher_data = teacher.json()
                    teachers.append(teacher_data)
            
            response = {
                'success': True,
                'message': teachers
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all assignments
            assignments = TeacherDepartmentModel.query.all()
            assignments_list = []
            for assignment in assignments:
                teacher = TeacherModel.find_by_id(assignment.teacher_id)
                department = DepartmentModel.find_by_id(assignment.department_id)
                if teacher and department:
                    assignment_data = assignment.json()
                    assignment_data['teacher_name'] = f"{teacher.given_name} {teacher.surname}"
                    assignment_data['department_name'] = department.department_name
                    assignments_list.append(assignment_data)
            
            response = {
                'success': True,
                'message': assignments_list
            }
            return Response(json.dumps(response), 200)

    def delete(self, teacher_id, department_id=None):
        if department_id:
            # Delete specific teacher-department assignment
            success = TeacherDepartmentModel.delete_by_teacher_and_department(
                UUID(teacher_id), UUID(department_id)
            )
            if success:
                response = {
                    'success': True,
                    'message': 'Teacher-department assignment deleted successfully'
                }
                return Response(json.dumps(response), 200)
            else:
                response = {
                    'success': False,
                    'message': 'Assignment not found'
                }
                return Response(json.dumps(response), 404)
        else:
            # Delete all assignments for a teacher
            assignments = TeacherDepartmentModel.find_by_teacher_id(UUID(teacher_id))
            for assignment in assignments:
                db.session.delete(assignment)
            db.session.commit()
            
            response = {
                'success': True,
                'message': 'All teacher-department assignments deleted successfully'
            }
            return Response(json.dumps(response), 200)
