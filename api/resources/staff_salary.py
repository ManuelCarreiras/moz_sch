from flask_restful import Resource
from flask import Response, request
from models.staff_salary import StaffSalaryModel
from models.staff import StaffModel
from utils.auth_middleware import require_role
import json
from datetime import datetime
from decimal import Decimal


class StaffSalaryResource(Resource):
    """
    Resource for managing staff monthly salary payments
    """

    @require_role('admin')
    def get(self, salary_id=None):
        """
        GET /staff_salary - Get all salary records (with filters)
        GET /staff_salary/<salary_id> - Get specific salary record
        Query params: staff_id, month, year, paid (true/false), role
        """
        if salary_id:
            salary = StaffSalaryModel.find_by_id(salary_id)
            if not salary:
                return {'message': 'Salary record not found'}, 404
            return {'salary': salary.json_with_staff()}, 200

        # Get all salary records with optional filters
        staff_id = request.args.get('staff_id')
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        paid = request.args.get('paid')  # Can be 'true' or 'false'

        if staff_id and month and year:
            salary = StaffSalaryModel.find_by_staff_and_month(staff_id, month, year)
            if salary:
                return {'salary': salary.json_with_staff()}, 200
            return {'salary': None}, 200
        elif staff_id:
            records = StaffSalaryModel.find_by_staff_id(staff_id)
            enhanced_records = [r.json_with_staff() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200
        elif month and year:
            records = StaffSalaryModel.find_by_month_year(month, year)
            enhanced_records = [r.json_with_staff() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200
        elif paid:
            is_paid = paid.lower() == 'true'
            if staff_id:
                records = [r for r in StaffSalaryModel.find_by_staff_id(staff_id) if r.paid == is_paid]
            else:
                records = StaffSalaryModel.find_unpaid() if not is_paid else StaffSalaryModel.find_all()
                records = [r for r in records if r.paid == is_paid]
            enhanced_records = [r.json_with_staff() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200
        else:
            records = StaffSalaryModel.find_all()
            enhanced_records = [r.json_with_staff() for r in records]
            return {'salary_records': enhanced_records, 'count': len(enhanced_records)}, 200

    @require_role('admin')
    def post(self):
        """
        POST /staff_salary - Create a new salary record
        """
        data = request.get_json()

        # Validate required fields
        if not data.get('staff_id'):
            return {'message': 'Staff ID is required'}, 400
        if not data.get('value'):
            return {'message': 'Value is required'}, 400
        if not data.get('due_date'):
            return {'message': 'Due date is required'}, 400
        if not data.get('month'):
            return {'message': 'Month is required'}, 400
        if not data.get('year'):
            return {'message': 'Year is required'}, 400

        # Validate staff exists
        staff = StaffModel.find_by_id(data['staff_id'])
        if not staff:
            return {'message': 'Staff member not found'}, 404

        # Check if salary already exists for this staff member, month, and year
        existing = StaffSalaryModel.find_by_staff_and_month(
            data['staff_id'], 
            data['month'], 
            data['year']
        )
        if existing:
            return {'message': 'Salary already exists for this staff member, month, and year'}, 400

        try:
            # Parse due_date
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
            payment_date = None
            if data.get('payment_date'):
                payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').date() if isinstance(data['payment_date'], str) else data['payment_date']

            new_salary = StaffSalaryModel(
                staff_id=data['staff_id'],
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
                'salary': new_salary.json_with_staff()
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

    @require_role('admin')
    def put(self):
        """
        PUT /staff_salary - Update salary record
        """
        data = request.get_json()

        if not data or not data.get('_id'):
            return {'message': 'Salary ID is required'}, 400

        salary = StaffSalaryModel.find_by_id(data['_id'])
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
                'salary': salary.json_with_staff()
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

    @require_role('admin')
    def delete(self, salary_id=None):
        """
        DELETE /staff_salary/<salary_id> - Delete salary record
        """
        if not salary_id:
            return {'message': 'Salary ID is required'}, 400
            
        salary = StaffSalaryModel.find_by_id(salary_id)
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


class StaffSalaryByStaffResource(Resource):
    """
    Resource for getting salary records for a specific staff member
    """

    @require_role('admin')
    def get(self, staff_id):
        """
        GET /staff_salary/staff/<staff_id> - Get all salary records for a staff member
        """
        # Verify staff exists
        staff = StaffModel.find_by_id(staff_id)
        if not staff:
            return {'message': 'Staff member not found'}, 404

        records = StaffSalaryModel.find_by_staff_id(staff_id)
        enhanced_records = [r.json_with_staff() for r in records]
        
        return {
            'staff': staff.json(),
            'salary_records': enhanced_records, 
            'count': len(enhanced_records)
        }, 200


class StaffSalaryGridResource(Resource):
    """
    Resource for managing staff base salary grid
    """

    @require_role('admin')
    def get(self):
        """
        GET /staff_salary/grid - Get all staff with their base salaries
        Query params: role (optional) - filter by role
        Returns a grid/list of all staff with their base salary values
        """
        role_filter = request.args.get('role')
        
        if role_filter:
            staff_list = StaffModel.find_by_role(role_filter)
        else:
            staff_list = StaffModel.find_all()
        
        grid = []
        for staff in staff_list:
            grid.append({
                'staff_id': str(staff._id),
                'staff_name': f"{staff.given_name} {staff.surname}",
                'email': staff.email_address,
                'role': staff.role,
                'hire_date': staff.hire_date.isoformat() if staff.hire_date else None,
                'base_salary': float(staff.base_salary) if staff.base_salary else None
            })
        
        return {'salary_grid': grid, 'count': len(grid)}, 200

    @require_role('admin')
    def put(self):
        """
        PUT /staff_salary/grid - Update base salaries for multiple staff members
        Body: { salaries: [{ staff_id: uuid, base_salary: decimal }, ...] }
        """
        data = request.get_json()
        
        if not data or not data.get('salaries'):
            return {'message': 'Salaries array is required'}, 400
        
        updated_count = 0
        errors = []
        
        for item in data['salaries']:
            if not item.get('staff_id'):
                errors.append('Missing staff_id in salary item')
                continue
            
            staff = StaffModel.find_by_id(item['staff_id'])
            if not staff:
                errors.append(f'Staff member {item["staff_id"]} not found')
                continue
            
            try:
                base_salary = Decimal(str(item['base_salary'])) if item.get('base_salary') else None
                staff.update_entry({'base_salary': base_salary})
                updated_count += 1
            except Exception as e:
                errors.append(f"Error updating salary for staff {item['staff_id']}: {str(e)}")
        
        response = {
            'success': True,
            'message': f'Updated {updated_count} staff salaries',
            'updated': updated_count,
            'errors': errors if errors else None
        }
        return Response(json.dumps(response), 200, mimetype='application/json')


class GenerateStaffSalaryResource(Resource):
    """
    Resource for generating monthly salary records for all staff
    Uses base_salary from staff table
    """

    @require_role('admin')
    def post(self):
        """
        POST /staff_salary/generate - Generate salary records for all staff for a given month/year
        Body: { month: int, year: int, due_date: 'YYYY-MM-DD', notes?: string, role?: string }
        Uses base_salary from each staff member's record. Skips staff without base_salary set.
        Optional role filter to only generate for specific role (financial/secretary).
        """
        data = request.get_json()

        if not data.get('month') or not data.get('year'):
            return {'message': 'Month and year are required'}, 400
        if not data.get('due_date'):
            return {'message': 'Due date is required'}, 400

        month = data['month']
        year = data['year']
        role_filter = data.get('role')
        
        try:
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if isinstance(data['due_date'], str) else data['due_date']
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

        # Get staff members (optionally filtered by role)
        if role_filter:
            all_staff = StaffModel.find_by_role(role_filter)
        else:
            all_staff = StaffModel.find_all()
        
        created_count = 0
        skipped_count = 0
        errors = []
        skipped_no_salary = []

        for staff in all_staff:
            # Check if salary already exists
            existing = StaffSalaryModel.find_by_staff_and_month(staff._id, month, year)
            if existing:
                skipped_count += 1
                continue

            # Get base_salary from staff record
            if not staff.base_salary:
                skipped_no_salary.append(f"{staff.given_name} {staff.surname} ({staff.role})")
                continue

            try:
                new_salary = StaffSalaryModel(
                    staff_id=staff._id,
                    value=staff.base_salary,
                    due_date=due_date,
                    month=month,
                    year=year,
                    paid=False,
                    notes=data.get('notes')
                )
                new_salary.save_to_db()
                created_count += 1
            except Exception as e:
                errors.append(f"Error creating salary for staff {staff._id}: {str(e)}")

        response = {
            'success': True,
            'message': f'Generated {created_count} salary records',
            'created': created_count,
            'skipped': skipped_count,
            'skipped_no_base_salary': skipped_no_salary if skipped_no_salary else None,
            'errors': errors if errors else None
        }
        return Response(json.dumps(response), 200, mimetype='application/json')
