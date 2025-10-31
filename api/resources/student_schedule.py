from flask import request, Response
from flask_restful import Resource
from models.student_class import StudentClassModel
from models.student import StudentModel
from models.class_model import ClassModel
from models.term import TermModel
from models.school_year import SchoolYearModel
from models.period import PeriodModel
from models.teacher import TeacherModel
from models.subject import SubjectModel
from models.classroom import ClassroomModel
from models.year_level import YearLevelModel
import json
import logging
from utils.auth_middleware import require_role


class StudentScheduleResource(Resource):
    """Get student schedule filtered by term and year"""

    def get(self, student_id=None):
        # Get query parameters for filtering
        term_id = request.args.get('term_id')
        year_id = request.args.get('year_id')
        
        # If no student_id provided, try to get from authenticated user
        if not student_id:
            from flask import g
            # Try to get student by email or username from JWT token
            email = getattr(g, 'email', None)
            username = getattr(g, 'username', None)
            
            logging.info(f"Looking up student - email: {email}, username: {username}")
            
            student = None
            if email:
                student = StudentModel.find_by_email(email)
            
            # If email lookup failed or no email, try username lookup
            if not student and username:
                student = StudentModel.find_by_username(username)
            
            logging.info(f"Student lookup result: {student}")
            
            if student:
                student_id = str(student._id)
            else:
                # Check if any students exist in the database
                all_students = StudentModel.find_all()
                logging.info(f"Total students in DB: {len(all_students)}")
                if all_students:
                    for s in all_students[:5]:  # Log first 5 students
                        logging.info(f"Student in DB: email={s.email}, username={s.username}, name={s.given_name} {s.surname}")
                
                search_terms = []
                if email:
                    search_terms.append(f"email: {email}")
                if username:
                    search_terms.append(f"username: {username}")
                search_info = " or ".join(search_terms) if search_terms else "provided credentials"
                
                response = {
                    'success': False,
                    'message': f'Student not found for {search_info}. Please ensure the student record exists with matching email or username.'
                }
                return Response(json.dumps(response), 404)
        
        # Verify student exists
        student = StudentModel.find_by_id(student_id)
        if not student:
            response = {
                'success': False,
                'message': 'Student not found'
            }
            return Response(json.dumps(response), 404)

        # Get all student class enrollments
        student_classes = StudentClassModel.find_by_student_id(student_id)
        
        if not student_classes:
            response = {
                'success': True,
                'message': {
                    'student_id': student_id,
                    'student_name': f"{student.given_name} {student.surname}",
                    'timetable': [],
                    'available_terms': [],
                    'available_years': []
                }
            }
            return Response(json.dumps(response), 200)

        # Build list of class IDs
        class_ids = [sc.class_id for sc in student_classes]
        
        # Get all class details
        all_classes = []
        available_terms_map = {}
        available_years_map = {}
        
        for class_item in class_ids:
            class_obj = ClassModel.find_by_id(class_item)
            if not class_obj:
                continue
            
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
            
            # Enhance class data
            class_data = class_obj.json()
            class_data['subject_name'] = None
            class_data['teacher_name'] = None
            class_data['period_name'] = None
            class_data['day_of_week'] = class_obj.day_of_week
            class_data['period_start'] = None
            class_data['period_end'] = None
            class_data['classroom_name'] = None
            class_data['term_number'] = term.term_number
            class_data['year_name'] = year.year_name if year else None
            
            # Get related entities
            subject = SubjectModel.find_by_id(class_obj.subject_id) if class_obj.subject_id else None
            teacher = TeacherModel.find_by_id(class_obj.teacher_id) if class_obj.teacher_id else None
            period = PeriodModel.find_by_id(class_obj.period_id) if class_obj.period_id else None
            classroom = ClassroomModel.find_by_id(class_obj.classroom_id) if class_obj.classroom_id else None
            
            if subject:
                class_data['subject_name'] = subject.subject_name
            if teacher:
                class_data['teacher_name'] = f"{teacher.given_name} {teacher.surname}"
            if period:
                class_data['period_name'] = period.name
                class_data['period_start'] = period.start_time.isoformat() if period.start_time else None
                class_data['period_end'] = period.end_time.isoformat() if period.end_time else None
            if classroom:
                class_data['classroom_name'] = classroom.room_name
            
            # Get year level info
            year_level = YearLevelModel.find_by_id(class_obj.year_level_id)
            if year_level:
                class_data['year_level_name'] = year_level.level_name
                class_data['year_level_order'] = year_level.level_order
            
            all_classes.append(class_data)
        
        # Sort by period start time if available
        all_classes.sort(key=lambda x: x.get('period_start', '') if x.get('period_start') else '')
        
        # Get all periods to build the full grid structure
        all_periods = PeriodModel.find_all_ordered()
        all_periods_data = [period.json() for period in all_periods]
        
        response = {
            'success': True,
            'message': {
                'student_id': student_id,
                'student_name': f"{student.given_name} {student.surname}",
                'timetable': all_classes,
                'all_periods': all_periods_data,
                'available_terms': list(available_terms_map.values()),
                'available_years': list(available_years_map.values())
            }
        }
        
        return Response(json.dumps(response), 200)

