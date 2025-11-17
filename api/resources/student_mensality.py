from flask_restful import Resource
from flask import Response, request, g
from models.student_mensality import StudentMensalityModel
from models.student import StudentModel
from utils.auth_middleware import require_any_role
import json
from datetime import datetime, date
from decimal import Decimal


class StudentMensalityResource(Resource):
    """
    Resource for managing student monthly payments (mensality)
    """

    @require_any_role(['admin'])
    def get(self, mensality_id=None):
        """
        GET /mensality - Get all mensality records (with filters)
        GET /mensality/<mensality_id> - Get specific mensality record
        Query params: student_id, month, year, paid (true/false)
        """
        if mensality_id:
            mensality = StudentMensalityModel.find_by_id(mensality_id)
            if not mensality:
                return {'message': 'Mensality record not found'}, 404
            return {'mensality': mensality.json_with_student()}, 200

        # Get all mensality records with optional filters
        student_id = request.args.get('student_id')
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        paid = request.args.get('paid')  # Can be 'true' or 'false'

        # Build query incrementally based on provided filters
        # Start with base query
        query = StudentMensalityModel.query
        
        # Apply filters
        if student_id:
            query = query.filter_by(student_id=student_id)
        if month is not None:
            query = query.filter_by(month=month)
        if year is not None:
            query = query.filter_by(year=year)
        if paid is not None:
            # Convert string 'true'/'false' to boolean
            is_paid = paid.lower() == 'true'
            query = query.filter_by(paid=is_paid)
        
        # Execute query and order results
        records = query.order_by(StudentMensalityModel.year.desc(), StudentMensalityModel.month.desc()).all()
        
        # Debug logging (can be removed later)
        from flask import current_app
        # Log the actual SQL query being executed
        current_app.logger.debug(f"Mensality query - month={month}, year={year}, paid={paid}, student_id={student_id}, found {len(records)} records")
        current_app.logger.debug(f"Query SQL: {str(query.statement.compile(compile_kwargs={'literal_binds': True}))}")
        current_app.logger.debug(f"Table name: {StudentMensalityModel.__tablename__}")
        
        # Special case: if student_id, month, and year are all provided, return single record format
        if student_id and month is not None and year is not None:
            if records:
                return {'mensality': records[0].json_with_student()}, 200
            return {'mensality': None}, 200
        
        # Otherwise return list format
        enhanced_records = [r.json_with_student() for r in records]
        return {'mensality_records': enhanced_records, 'count': len(enhanced_records)}, 200

    @require_any_role(['admin'])
    def post(self):
        """
        POST /mensality - Create a new mensality record
        """
        data = request.get_json()

        # Validate required fields
        if not data.get('student_id'):
            return {'message': 'Student ID is required'}, 400
        if not data.get('value'):
            return {'message': 'Value is required'}, 400
        if not data.get('due_date'):
            return {'message': 'Due date is required'}, 400
        if not data.get('month'):
            return {'message': 'Month is required'}, 400
        if not data.get('year'):
            return {'message': 'Year is required'}, 400

        # Validate student exists and is active
        student = StudentModel.find_by_id(data['student_id'])
        if not student:
            return {'message': 'Student not found'}, 404
        if not student.is_active:
            return {'message': 'Cannot create mensality for inactive student'}, 400

        # Check if mensality already exists for this student, month, and year
        existing = StudentMensalityModel.find_by_student_and_month(
            data['student_id'], 
            data['month'], 
            data['year']
        )
        if existing:
            return {'message': 'Mensality already exists for this student, month, and year'}, 400

        try:
            # Parse due_date
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
            payment_date = None
            if data.get('payment_date'):
                payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').date() if isinstance(data['payment_date'], str) else data['payment_date']

            new_mensality = StudentMensalityModel(
                student_id=data['student_id'],
                value=Decimal(str(data['value'])),
                due_date=due_date,
                month=data['month'],
                year=data['year'],
                paid=data.get('paid', False),
                payment_date=payment_date,
                notes=data.get('notes')
            )
            new_mensality.save_to_db()

            response = {
                'success': True,
                'message': 'Mensality record created successfully',
                'mensality': new_mensality.json_with_student()
            }
            return Response(json.dumps(response), 201, mimetype='application/json')

        except ValueError as e:
            return {'message': f'Invalid date format: {str(e)}'}, 400
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error creating mensality record: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin'])
    def put(self):
        """
        PUT /mensality - Update mensality record
        """
        data = request.get_json()

        if not data or not data.get('_id'):
            return {'message': 'Mensality ID is required'}, 400

        mensality = StudentMensalityModel.find_by_id(data['_id'])
        if not mensality:
            return {'message': 'Mensality record not found'}, 404

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

            mensality.update_entry(update_data)

            response = {
                'success': True,
                'message': 'Mensality record updated successfully',
                'mensality': mensality.json_with_student()
            }
            return Response(json.dumps(response), 200, mimetype='application/json')

        except ValueError as e:
            return {'message': f'Invalid date format: {str(e)}'}, 400
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error updating mensality record: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin'])
    def delete(self, mensality_id=None):
        """
        DELETE /mensality/<mensality_id> - Delete mensality record
        """
        if not mensality_id:
            return {'message': 'Mensality ID is required'}, 400
            
        mensality = StudentMensalityModel.find_by_id(mensality_id)
        if not mensality:
            return {'message': 'Mensality record not found'}, 404

        try:
            mensality.delete_from_db()
            response = {
                'success': True,
                'message': 'Mensality record deleted successfully'
            }
            return Response(json.dumps(response), 200, mimetype='application/json')

        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting mensality record: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')


class GenerateMensalityResource(Resource):
    """
    Resource for generating monthly mensality records for all active students
    """

    @require_any_role(['admin'])
    def post(self):
        """
        POST /mensality/generate - Generate mensality records for all active students for a given month/year
        Body: { month: int, year: int, value: decimal, due_date: 'YYYY-MM-DD' }
        """
        data = request.get_json()

        if not data.get('month') or not data.get('year'):
            return {'message': 'Month and year are required'}, 400
        if not data.get('value'):
            return {'message': 'Value is required'}, 400
        if not data.get('due_date'):
            return {'message': 'Due date is required'}, 400

        month = data['month']
        year = data['year']
        value = Decimal(str(data['value']))
        
        try:
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

        # Get all active students
        active_students = StudentModel.find_active()
        
        created_count = 0
        skipped_count = 0
        errors = []

        for student in active_students:
            # Check if mensality already exists
            existing = StudentMensalityModel.find_by_student_and_month(student._id, month, year)
            if existing:
                skipped_count += 1
                continue

            try:
                new_mensality = StudentMensalityModel(
                    student_id=student._id,
                    value=value,
                    due_date=due_date,
                    month=month,
                    year=year,
                    paid=False,
                    notes=data.get('notes')
                )
                new_mensality.save_to_db()
                created_count += 1
            except Exception as e:
                errors.append(f"Error creating mensality for student {student._id}: {str(e)}")

        response = {
            'success': True,
            'message': f'Generated {created_count} mensality records',
            'created': created_count,
            'skipped': skipped_count,
            'errors': errors if errors else None
        }
        return Response(json.dumps(response), 200, mimetype='application/json')

