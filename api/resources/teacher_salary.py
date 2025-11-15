from flask_restful import Resource
from flask import Response, request, g
from models.teacher_salary import TeacherSalaryModel
from models.teacher import TeacherModel
from utils.auth_middleware import require_any_role
import json
from datetime import datetime, date
from decimal import Decimal


class TeacherSalaryResource(Resource):
    """
    Resource for managing teacher monthly salary payments
    """

    @require_any_role(['admin'])
    def get(self, salary_id=None):
        """
        GET /teacher_salary - Get all salary records (with filters)
        GET /teacher_salary/<salary_id> - Get specific salary record
        Query params: teacher_id, month, year, paid (true/false)
        """
        if salary_id:
            salary = TeacherSalaryModel.find_by_id(salary_id)
            if not salary:
                return {'message': 'Salary record not found'}, 404
            return {'salary': salary.json_with_teacher()}, 200

        # Get all salary records with optional filters
        teacher_id = request.args.get('teacher_id')
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        paid = request.args.get('paid')  # Can be 'true' or 'false'

        if teacher_id and month and year:
            salary = TeacherSalaryModel.find_by_teacher_and_month(teacher_id, month, year)
            if salary:
                return {'salary': salary.json_with_teacher()}, 200
            return {'salary': None}, 200
        elif teacher_id:
            records = TeacherSalaryModel.find_by_teacher_id(teacher_id)
            enhanced_records = [r.json_with_teacher() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200
        elif month and year:
            records = TeacherSalaryModel.find_by_month_year(month, year)
            enhanced_records = [r.json_with_teacher() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200
        elif paid:
            is_paid = paid.lower() == 'true'
            if teacher_id:
                records = [r for r in TeacherSalaryModel.find_by_teacher_id(teacher_id) if r.paid == is_paid]
            else:
                records = TeacherSalaryModel.find_unpaid() if not is_paid else TeacherSalaryModel.find_all()
                records = [r for r in records if r.paid == is_paid]
            enhanced_records = [r.json_with_teacher() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200
        else:
            records = TeacherSalaryModel.find_all()
            enhanced_records = [r.json_with_teacher() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200

    @require_any_role(['admin'])
    def post(self):
        """
        POST /teacher_salary - Create a new salary record
        """
        data = request.get_json()

        # Validate required fields
        if not data.get('teacher_id'):
            return {'message': 'Teacher ID is required'}, 400
        if not data.get('value'):
            return {'message': 'Value is required'}, 400
        if not data.get('due_date'):
            return {'message': 'Due date is required'}, 400
        if not data.get('month'):
            return {'message': 'Month is required'}, 400
        if not data.get('year'):
            return {'message': 'Year is required'}, 400

        # Validate teacher exists
        teacher = TeacherModel.find_by_id(data['teacher_id'])
        if not teacher:
            return {'message': 'Teacher not found'}, 404

        # Check if salary already exists for this teacher, month, and year
        existing = TeacherSalaryModel.find_by_teacher_and_month(
            data['teacher_id'], 
            data['month'], 
            data['year']
        )
        if existing:
            return {'message': 'Salary already exists for this teacher, month, and year'}, 400

        try:
            # Parse due_date
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
            payment_date = None
            if data.get('payment_date'):
                payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').date() if isinstance(data['payment_date'], str) else data['payment_date']

            new_salary = TeacherSalaryModel(
                teacher_id=data['teacher_id'],
                value=Decimal(str(data['value'])),
                due_date=due_date,
                month=data['month'],
                year=data['year'],
                paid=data.get('paid', False),
                payment_date=payment_date,
                notes=data.get('notes')
            )
            new_salary.save_to_db()

            response = {
                'success': True,
                'message': 'Salary record created successfully',
                'salary': new_salary.json_with_teacher()
            }
            return Response(json.dumps(response), 201, mimetype='application/json')

        except ValueError as e:
            return {'message': f'Invalid date format: {str(e)}'}, 400
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error creating salary record: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin'])
    def put(self):
        """
        PUT /teacher_salary - Update salary record
        """
        data = request.get_json()

        if not data or not data.get('_id'):
            return {'message': 'Salary ID is required'}, 400

        salary = TeacherSalaryModel.find_by_id(data['_id'])
        if not salary:
            return {'message': 'Salary record not found'}, 404

        try:
            update_data = {}
            if 'paid' in data:
                update_data['paid'] = data['paid']
            if 'payment_date' in data:
                if data['payment_date']:
                    update_data['payment_date'] = datetime.strptime(data['payment_date'], '%Y-%m-%d').date() if isinstance(data['payment_date'], str) else data['payment_date']
                else:
                    update_data['payment_date'] = None
            if 'value' in data:
                update_data['value'] = Decimal(str(data['value']))
            if 'due_date' in data:
                update_data['due_date'] = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
            if 'notes' in data:
                update_data['notes'] = data['notes']

            salary.update_entry(update_data)

            response = {
                'success': True,
                'message': 'Salary record updated successfully',
                'salary': salary.json_with_teacher()
            }
            return Response(json.dumps(response), 200, mimetype='application/json')

        except ValueError as e:
            return {'message': f'Invalid date format: {str(e)}'}, 400
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error updating salary record: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin'])
    def delete(self, salary_id=None):
        """
        DELETE /teacher_salary/<salary_id> - Delete salary record
        """
        if not salary_id:
            return {'message': 'Salary ID is required'}, 400
            
        salary = TeacherSalaryModel.find_by_id(salary_id)
        if not salary:
            return {'message': 'Salary record not found'}, 404

        try:
            salary.delete_from_db()
            response = {
                'success': True,
                'message': 'Salary record deleted successfully'
            }
            return Response(json.dumps(response), 200, mimetype='application/json')

        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting salary record: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')


class GenerateSalaryResource(Resource):
    """
    Resource for generating monthly salary records for all teachers
    """

    @require_any_role(['admin'])
    def post(self):
        """
        POST /teacher_salary/generate - Generate salary records for all teachers for a given month/year
        Body: { month: int, year: int, value: decimal, due_date: 'YYYY-MM-DD' }
        OR Body: { month: int, year: int, due_date: 'YYYY-MM-DD', salaries: [{ teacher_id: uuid, value: decimal }] }
        If salaries array is provided, uses individual values per teacher. Otherwise uses single value for all.
        """
        data = request.get_json()

        if not data.get('month') or not data.get('year'):
            return {'message': 'Month and year are required'}, 400
        if not data.get('due_date'):
            return {'message': 'Due date is required'}, 400

        month = data['month']
        year = data['year']
        
        try:
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

        # Check if we have individual salaries or a single value
        salaries_by_teacher = {}
        if data.get('salaries') and isinstance(data['salaries'], list):
            # Individual salaries per teacher
            for item in data['salaries']:
                if item.get('teacher_id') and item.get('value'):
                    salaries_by_teacher[item['teacher_id']] = Decimal(str(item['value']))
        elif data.get('value'):
            # Single value for all teachers (will be set below)
            default_value = Decimal(str(data['value']))
        else:
            return {'message': 'Either value or salaries array is required'}, 400

        # Get all teachers
        all_teachers = TeacherModel.find_all()
        
        created_count = 0
        skipped_count = 0
        errors = []

        for teacher in all_teachers:
            # Check if salary already exists
            existing = TeacherSalaryModel.find_by_teacher_and_month(teacher._id, month, year)
            if existing:
                skipped_count += 1
                continue

            # Get value for this teacher
            teacher_id_str = str(teacher._id)
            if salaries_by_teacher:
                if teacher_id_str not in salaries_by_teacher:
                    # Skip teachers not in the salaries list
                    skipped_count += 1
                    continue
                value = salaries_by_teacher[teacher_id_str]
            else:
                value = default_value

            try:
                new_salary = TeacherSalaryModel(
                    teacher_id=teacher._id,
                    value=value,
                    due_date=due_date,
                    month=month,
                    year=year,
                    paid=False,
                    notes=data.get('notes')
                )
                new_salary.save_to_db()
                created_count += 1
            except Exception as e:
                errors.append(f"Error creating salary for teacher {teacher._id}: {str(e)}")

        response = {
            'success': True,
            'message': f'Generated {created_count} salary records',
            'created': created_count,
            'skipped': skipped_count,
            'errors': errors if errors else None
        }
        return Response(json.dumps(response), 200, mimetype='application/json')

