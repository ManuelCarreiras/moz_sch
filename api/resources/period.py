from flask import request, Response
from flask_restful import Resource
from models.period import PeriodModel
from models.school_year import SchoolYearModel
import json


class PeriodResource(Resource):
    def get(self, id=None):
        if id:
            # Get specific period by ID
            period = PeriodModel.find_by_id(id)
            if period is None:
                response = {
                    'success': False,
                    'message': 'Period not found'
                }
                return Response(json.dumps(response), 404)
            response = {
                'success': True,
                'message': period.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all periods
            periods = PeriodModel.query.all()
            periods_list = [period.json() for period in periods]
            response = {
                'success': True,
                'message': periods_list
            }
            return Response(json.dumps(response), 200)

    def post(self):
        data = request.get_json()

        if (
            not data.get('year_id') or
            not data.get('name') or
            not data.get('start_time') or
            not data.get('end_time')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), 400)
        
        # Validate that the school year exists
        school_year = SchoolYearModel.find_by_id(data.get('year_id'))
        if not school_year:
            response = {
                'success': False,
                'message': 'School year not found'
            }
            return Response(json.dumps(response), 400)
        
        # Convert time strings to datetime objects for today's date
        from datetime import datetime, date, time
        try:
            # Parse time strings (e.g., "08:00", "10:00")
            start_time_str = data.get('start_time')
            end_time_str = data.get('end_time')
            
            # Parse time components
            start_hour, start_minute = map(int, start_time_str.split(':'))
            end_hour, end_minute = map(int, end_time_str.split(':'))
            
            # Create time objects
            start_time_obj = time(start_hour, start_minute)
            end_time_obj = time(end_hour, end_minute)
            
            # Validate time logic
            if start_time_obj >= end_time_obj:
                response = {
                    'success': False,
                    'message': 'Start time must be before end time'
                }
                return Response(json.dumps(response), 400)
            
            # Create datetime objects for today (periods are time-based, not date-specific)
            today = date.today()
            start_datetime = datetime.combine(today, start_time_obj)
            end_datetime = datetime.combine(today, end_time_obj)
            
            # Update data with proper datetime objects
            data['start_time'] = start_datetime
            data['end_time'] = end_datetime
            
        except ValueError:
            response = {
                'success': False,
                'message': 'Invalid time format. Use HH:MM format'
            }
            return Response(json.dumps(response), 400)

        new_period = PeriodModel(**data)
        new_period.save_to_db()

        response = {
            'success': True,
            'message': new_period.json()
        }
        return Response(json.dumps(response), 201)


    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'period does not exist'
            }
            return Response(json.dumps(response), 404)

        period = PeriodModel.find_by_id(data['_id'])

        if period is None:
            response = {
                'success': False,
                'message': 'period does not exist'
            }
            return Response(json.dumps(response), 404)

        period.update_entry(data)

        response = {
            'success': True,
            'message': period.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        period = PeriodModel.find_by_id(id)

        if period is None:
            response = {
                'success': False,
                'message': 'Period does not exist'
            }
            return Response(json.dumps(response), 404)

        period.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Period record deleted'
            }

        return Response(json.dumps(response), 200)
