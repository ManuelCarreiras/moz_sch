from flask import Response
from flask_restful import Resource
from models.class_model import ClassModel
from models.year_level import YearLevelModel
from models.period import PeriodModel
from models.teacher import TeacherModel
from models.subject import SubjectModel
from models.classroom import ClassroomModel
import json


class ClassTimetableResource(Resource):
    """Get timetable for a specific year level"""

    def get(self, year_level_id):
        # Verify year level exists
        year_level = YearLevelModel.find_by_id(year_level_id)
        if not year_level:
            response = {
                'success': False,
                'message': 'Year level not found'
            }
            return Response(json.dumps(response), 404)

        # Get all classes for this year level
        classes = ClassModel.find_by_year_level(year_level_id)
        
        # Get all periods to build the full grid structure
        # Assuming all periods share the same year_id, we'll fetch all periods
        all_periods = PeriodModel.query.all()
        
        # Build timetable with enhanced data
        timetable = []
        for class_item in classes:
            class_data = class_item.json()
            
            # Enhance with related data
            subject = SubjectModel.find_by_id(class_item.subject_id)
            teacher = TeacherModel.find_by_id(class_item.teacher_id)
            period = PeriodModel.find_by_id(class_item.period_id)
            classroom = ClassroomModel.find_by_id(class_item.classroom_id)
            
            class_data['subject_name'] = subject.subject_name if subject else None
            class_data['teacher_name'] = f"{teacher.given_name} {teacher.surname}" if teacher else None
            class_data['period_name'] = period.name if period else None
            class_data['day_of_week'] = class_item.day_of_week  # Get day_of_week from class, not period
            class_data['period_start'] = period.start_time.isoformat() if period else None
            class_data['period_end'] = period.end_time.isoformat() if period else None
            class_data['classroom_name'] = classroom.room_name if classroom else None
            
            timetable.append(class_data)
        
        # Sort by period start time if available
        timetable.sort(key=lambda x: x.get('period_start', '') if x.get('period_start') else '')
        
        # Build list of all periods for the grid
        all_periods_data = []
        for period in all_periods:
            all_periods_data.append(period.json())
        
        # Sort all periods by start time
        all_periods_data.sort(key=lambda x: x.get('start_time', ''))
        
        response = {
            'success': True,
            'message': {
                'year_level_id': year_level_id,
                'year_level_name': year_level.level_name,
                'year_level_order': year_level.level_order,
                'timetable': timetable,
                'all_periods': all_periods_data  # Include all periods for grid structure
            }
        }
        return Response(json.dumps(response), 200)


class ClassConflictsResource(Resource):
    """Check for conflicts in a year level's timetable"""

    def get(self, year_level_id):
        # Verify year level exists
        year_level = YearLevelModel.find_by_id(year_level_id)
        if not year_level:
            response = {
                'success': False,
                'message': 'Year level not found'
            }
            return Response(json.dumps(response), 404)

        # Get all classes for this year level
        classes = ClassModel.find_by_year_level(year_level_id)
        
        # Check for conflicts (same period assigned to multiple classes)
        conflicts = []
        period_map = {}
        
        for class_item in classes:
            period_id = str(class_item.period_id)
            if period_id in period_map:
                # Conflict found - two classes in same period
                conflicts.append({
                    'period_id': period_id,
                    'class_1': {
                        '_id': str(period_map[period_id]._id),
                        'class_name': period_map[period_id].class_name
                    },
                    'class_2': {
                        '_id': str(class_item._id),
                        'class_name': class_item.class_name
                    }
                })
            else:
                period_map[period_id] = class_item
        
        response = {
            'success': True,
            'message': {
                'year_level_id': year_level_id,
                'year_level_name': year_level.level_name,
                'conflicts': conflicts,
                'has_conflicts': len(conflicts) > 0
            }
        }
        return Response(json.dumps(response), 200)

