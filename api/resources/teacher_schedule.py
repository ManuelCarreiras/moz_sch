from flask import request, Response, g
from flask_restful import Resource
from models.class_model import ClassModel
from models.teacher import TeacherModel
from models.term import TermModel
from models.school_year import SchoolYearModel
from models.period import PeriodModel
from models.subject import SubjectModel
from models.classroom import ClassroomModel
from models.year_level import YearLevelModel
from utils.auth_middleware import require_any_role
import json
import logging


class TeacherScheduleResource(Resource):
    """Get teacher schedule filtered by term and year"""

    @require_any_role(['admin', 'teacher', 'student'])
    def get(self, teacher_id=None):
        # Get query parameters for filtering
        term_id = request.args.get('term_id')
        year_id = request.args.get('year_id')
        user_role = getattr(g, 'role', None)
        
        # If no teacher_id provided, try to get from authenticated user
        if not teacher_id:
            # Try to get teacher by email_address or username from JWT token
            email = getattr(g, 'email', None)
            username = getattr(g, 'username', None)
            
            logging.info(f"Looking up teacher - email: {email}, username: {username}, role: {user_role}")
            
            teacher = None
            if email:
                teacher = TeacherModel.find_by_email(email)
            
            # If email lookup failed or no email, try username lookup
            if not teacher and username:
                teacher = TeacherModel.find_by_username(username)
            
            logging.info(f"Teacher lookup result: {teacher}")
            
            if teacher:
                teacher_id = str(teacher._id)
            elif user_role == 'admin':
                # For admins, return all classes (no teacher_id filter)
                teacher_id = None
            else:
                # Check if any teachers exist in the database
                all_teachers = TeacherModel.find_all()
                logging.info(f"Total teachers in DB: {len(all_teachers)}")
                if all_teachers:
                    for t in all_teachers[:5]:  # Log first 5 teachers
                        logging.info(f"Teacher in DB: email={t.email_address}, username={t.username}, name={t.given_name} {t.surname}")
                
                search_terms = []
                if email:
                    search_terms.append(f"email: {email}")
                if username:
                    search_terms.append(f"username: {username}")
                search_info = " or ".join(search_terms) if search_terms else "provided credentials"
                
                response = {
                    'success': False,
                    'message': f'Teacher not found for {search_info}. Please ensure the teacher record exists with matching email or username.'
                }
                return Response(json.dumps(response), 404)
        
        # If admin and no teacher_id, get all classes
        if user_role == 'admin' and not teacher_id:
            teacher_classes = ClassModel.query.all()
            teacher_name = "All Teachers (Admin View)"
        else:
            # Verify teacher exists
            teacher = TeacherModel.find_by_id(teacher_id)
            if not teacher:
                response = {
                    'success': False,
                    'message': 'Teacher not found'
                }
                return Response(json.dumps(response), 404)
            
            teacher_name = f"{teacher.given_name} {teacher.surname}"
            # Get all classes where this teacher is assigned
            teacher_classes = ClassModel.list_by_teacher_id(teacher_id)
        
        if not teacher_classes:
            response = {
                'success': True,
                'message': {
                    'teacher_id': teacher_id if teacher_id else None,
                    'teacher_name': teacher_name,
                    'timetable': [],
                    'available_terms': [],
                    'available_years': []
                }
            }
            return Response(json.dumps(response), 200)

        # Build list of class data with enhanced information
        all_classes = []
        available_terms_map = {}
        available_years_map = {}
        
        for class_obj in teacher_classes:
            # Get term info
            term = TermModel.find_by_id(class_obj.term_id)
            if not term:
                continue
            
            # If filtering by term, skip if doesn't match
            if term_id and str(term._id) != term_id:
                continue
            
            # Get year info
            year = SchoolYearModel.find_by_id(term.year_id)
            if not year:
                continue
            
            # If filtering by year, skip if doesn't match
            if year_id and str(year._id) != year_id:
                continue
            
            # Store available terms and years for filter dropdowns
            available_terms_map[str(term._id)] = {
                '_id': str(term._id),
                'term_number': term.term_number,
                'year_id': str(term.year_id),
                'year_name': year.year_name if year else None,
                'start_date': term.start_date.isoformat() if term.start_date else None,
                'end_date': term.end_date.isoformat() if term.end_date else None
            }
            available_years_map[str(year._id)] = {
                '_id': str(year._id),
                'year_name': year.year_name,
                'start_date': year.start_date.isoformat() if year.start_date else None,
                'end_date': year.end_date.isoformat() if year.end_date else None
            }
            
            # Build class data with all related information
            class_data = class_obj.json()
            
            # Add subject info
            if class_obj.subject_id:
                subject = SubjectModel.find_by_id(class_obj.subject_id)
                class_data['subject_name'] = subject.subject_name if subject else None
            
            # Add period info
            if class_obj.period_id:
                period = PeriodModel.find_by_id(class_obj.period_id)
                class_data['period_name'] = period.name if period else None
                class_data['period_start'] = period.start_time.isoformat() if period else None
                class_data['period_end'] = period.end_time.isoformat() if period else None
            else:
                class_data['period_name'] = None
                class_data['period_start'] = None
                class_data['period_end'] = None
            
            # Add classroom info
            if class_obj.classroom_id:
                classroom = ClassroomModel.find_by_id(class_obj.classroom_id)
                class_data['classroom_name'] = classroom.room_name if classroom else None
            else:
                class_data['classroom_name'] = None
            
            # Add year level info
            year_level = YearLevelModel.find_by_id(class_obj.year_level_id)
            if year_level:
                class_data['year_level_id'] = str(year_level._id)
                class_data['year_level_name'] = year_level.level_name
                class_data['year_level_order'] = year_level.level_order
            
            # Add term and year info
            class_data['term_id'] = str(term._id) if term else None
            class_data['term_number'] = term.term_number if term else None
            class_data['year_id'] = str(year._id) if year else None
            class_data['year_name'] = year.year_name if year else None
            
            all_classes.append(class_data)
        
        # Sort by period start time if available
        all_classes.sort(key=lambda x: x.get('period_start', '') if x.get('period_start') else '')
        
        # Get all periods to build the full grid structure
        all_periods = PeriodModel.find_all_ordered()
        all_periods_data = [period.json() for period in all_periods]
        
        response = {
            'success': True,
            'message': {
                'teacher_id': teacher_id if teacher_id else None,
                'teacher_name': teacher_name,
                'timetable': all_classes,
                'all_periods': all_periods_data,
                'available_terms': list(available_terms_map.values()),
                'available_years': list(available_years_map.values())
            }
        }
        
        return Response(json.dumps(response), 200)

