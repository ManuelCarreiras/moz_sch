from flask_restful import Resource
from flask import Response, request, g
from models.attendance import AttendanceModel
from models.student import StudentModel
from models.class_model import ClassModel
from models.teacher import TeacherModel
from models.student_class import StudentClassModel
from utils.auth_middleware import require_any_role
import json
import logging
from datetime import datetime, date

class AttendanceResource(Resource):
    """
    Attendance Resource - Manage student attendance
    """

    @require_any_role(['admin', 'teacher', 'student'])
    def get(self, attendance_id=None):
        """
        GET /attendance/<attendance_id> - Get specific attendance record
        GET /attendance?student_id=X - Get attendance for student
        GET /attendance?class_id=X&date=YYYY-MM-DD - Get attendance for class on date
        """
        if attendance_id:
            # Get specific record
            attendance = AttendanceModel.find_by_id(attendance_id)
            if not attendance:
                return {'message': 'Attendance record not found'}, 404
            
            # Check permissions for students
            username = g.username if hasattr(g, 'username') else None
            user_role = g.role if hasattr(g, 'role') else None
            
            if user_role == 'student':
                student = StudentModel.find_by_username(username) if username else None
                if not student or str(attendance.student_id) != str(student._id):
                    return {'message': 'Access denied'}, 403
            
            return {'attendance': attendance.json()}, 200
        
        # Get attendance with filters
        student_id = request.args.get('student_id')
        class_id = request.args.get('class_id')
        date_str = request.args.get('date')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Date range query
        if start_date_str and end_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str).date()
                end_date = datetime.fromisoformat(end_date_str).date()
                
                records = AttendanceModel.find_by_date_range(
                    start_date, end_date, 
                    student_id=student_id, 
                    class_id=class_id
                )
                
                return {
                    'attendance_records': [r.json() for r in records],
                    'count': len(records)
                }, 200
            except ValueError as e:
                return {'message': f'Invalid date format: {str(e)}'}, 400
        
        # Specific class and date
        if class_id and date_str:
            try:
                attendance_date = datetime.fromisoformat(date_str).date()
                records = AttendanceModel.find_by_class_and_date(class_id, attendance_date)
                
                # Enhance with student info
                enhanced_records = []
                for record in records:
                    record_data = record.json()
                    student = StudentModel.find_by_id(record.student_id)
                    if student:
                        record_data['student_name'] = f"{student.given_name} {student.surname}"
                    enhanced_records.append(record_data)
                
                return {
                    'attendance_records': enhanced_records,
                    'count': len(enhanced_records),
                    'date': date_str,
                    'class_id': class_id
                }, 200
            except ValueError as e:
                return {'message': f'Invalid date format: {str(e)}'}, 400
        
        # Student's attendance
        if student_id:
            # Check permissions
            username = g.username if hasattr(g, 'username') else None
            user_role = g.role if hasattr(g, 'role') else None
            
            logging.info(f"[Attendance] Student attendance request - username: {username}, role: {user_role}, requested student_id: {student_id}")
            
            if user_role == 'student':
                student = StudentModel.find_by_username(username) if username else None
                logging.info(f"[Attendance] Student lookup result: {student._id if student else None}")
                
                if not student:
                    logging.error(f"[Attendance] Student not found for username: {username}")
                    return {'message': 'Student account not found'}, 403
                
                if str(student._id) != student_id:
                    logging.error(f"[Attendance] ID mismatch - DB: {student._id}, Requested: {student_id}")
                    # Allow access if requesting their own records by username match
                    # Override student_id with correct one from DB
                    student_id = str(student._id)
                    logging.info(f"[Attendance] Using student_id from DB: {student_id}")
            
            # Get optional filters
            subject_id = request.args.get('subject_id')
            term_id = request.args.get('term_id')
            year_id = request.args.get('year_id')
            
            records = AttendanceModel.find_by_student_id(student_id)
            
            # Enhance with class info and apply filters
            enhanced_records = []
            for record in records:
                record_data = record.json()
                class_obj = ClassModel.find_by_id(record.class_id)
                if class_obj:
                    record_data['class_name'] = class_obj.class_name
                    
                    # Apply filters based on class properties
                    if subject_id and str(class_obj.subject_id) != subject_id:
                        continue
                    if term_id and str(class_obj.term_id) != term_id:
                        continue
                    if year_id:
                        # Get term to check year
                        from models.term import TermModel
                        term = TermModel.find_by_id(class_obj.term_id)
                        if not term or str(term.year_id) != year_id:
                            continue
                    
                    # Add additional class info for display
                    from models.subject import SubjectModel
                    subject = SubjectModel.find_by_id(class_obj.subject_id)
                    if subject:
                        record_data['subject_name'] = subject.subject_name
                    
                    enhanced_records.append(record_data)
            
            return {
                'attendance_records': enhanced_records,
                'count': len(enhanced_records)
            }, 200
        
        # Class attendance (for admin/teacher viewing all students in a class)
        if class_id:
            # Get filters
            subject_id = request.args.get('subject_id')
            term_id = request.args.get('term_id')
            year_id = request.args.get('year_id')
            
            # Find ALL classes that match the filters (subject, term, year)
            # This handles cases where there are multiple class instances with the same name
            from models.term import TermModel
            
            matching_classes = []
            if subject_id and term_id:
                # Find all classes with this subject and term
                all_classes = ClassModel.query.filter_by(subject_id=subject_id, term_id=term_id).all()
                
                # Also get the class name from the provided class_id to match
                target_class = ClassModel.find_by_id(class_id)
                if target_class:
                    target_class_name = target_class.class_name
                    
                    # Filter to classes with the same name
                    matching_classes = [c for c in all_classes if c.class_name == target_class_name]
            
            if not matching_classes:
                return {'attendance_records': [], 'count': 0}, 200
            
            # Get all students enrolled in ANY of these matching classes
            from models.student_class import StudentClassModel
            student_ids = set()
            for cls in matching_classes:
                student_classes = StudentClassModel.query.filter_by(class_id=cls._id).all()
                for sc in student_classes:
                    student_ids.add(sc.student_id)
            
            student_ids = list(student_ids)
            
            # Get attendance records for all these students
            enhanced_records = []
            for student_id in student_ids:
                # Get all attendance for this student
                student_records = AttendanceModel.find_by_student_id(student_id)
                
                for record in student_records:
                    # Get the class for this attendance record
                    record_class = ClassModel.find_by_id(record.class_id)
                    if not record_class:
                        continue
                    
                    # Apply filters - must match subject, term, year
                    if subject_id and str(record_class.subject_id) != subject_id:
                        continue
                    
                    if term_id and str(record_class.term_id) != term_id:
                        continue
                    
                    if year_id:
                        from models.term import TermModel
                        term = TermModel.find_by_id(record_class.term_id)
                        if not term or str(term.year_id) != year_id:
                            continue
                    
                    # Build record data
                    record_data = record.json()
                    
                    # Add student name
                    student = StudentModel.find_by_id(record.student_id)
                    if student:
                        record_data['student_name'] = f"{student.given_name} {student.surname}"
                    
                    # Add class name
                    record_data['class_name'] = record_class.class_name
                    
                    enhanced_records.append(record_data)
            
            return {
                'attendance_records': enhanced_records,
                'count': len(enhanced_records)
            }, 200
        
        return {'message': 'Please provide student_id, class_id, or date filters'}, 400

    @require_any_role(['admin', 'teacher'])
    def post(self):
        """
        POST /attendance - Create or update attendance record(s)
        Body: {
            "class_id": "uuid",
            "date": "YYYY-MM-DD",
            "attendance": [
                {"student_id": "uuid", "status": "present|absent|late|excused", "notes": "..."}
            ]
        }
        """
        data = request.get_json()
        
        if not data:
            return {'message': 'No data provided'}, 400
        
        # Validate required fields
        if 'class_id' not in data or 'date' not in data or 'attendance' not in data:
            return {'message': 'class_id, date, and attendance array are required'}, 400
        
        # Validate class exists
        class_obj = ClassModel.find_by_id(data['class_id'])
        if not class_obj:
            return {'message': 'Class not found'}, 404
        
        # Parse date
        try:
            attendance_date = datetime.fromisoformat(data['date']).date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400
        
        # Get current user
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        
        created_by = None
        if user_role == 'teacher' and username:
            teacher = TeacherModel.find_by_username(username)
            if teacher:
                created_by = teacher._id
        
        created_records = []
        updated_records = []
        errors = []
        
        try:
            for attendance_item in data['attendance']:
                student_id = attendance_item.get('student_id')
                status = attendance_item.get('status', 'present')
                notes = attendance_item.get('notes')
                
                if not student_id:
                    errors.append('Missing student_id in attendance item')
                    continue
                
                # Validate student exists
                student = StudentModel.find_by_id(student_id)
                if not student:
                    errors.append(f'Student {student_id} not found')
                    continue
                
                # Check if record already exists
                existing = AttendanceModel.find_by_student_class_date(
                    student_id, data['class_id'], attendance_date
                )
                
                if existing:
                    # Update existing record
                    existing.status = status
                    if notes:
                        existing.notes = notes
                    existing.updated_date = datetime.now()
                    existing.save_to_db()
                    updated_records.append(existing.json())
                else:
                    # Create new record
                    new_attendance = AttendanceModel(
                        student_id=student_id,
                        class_id=data['class_id'],
                        date=attendance_date,
                        status=status,
                        notes=notes,
                        created_by=created_by
                    )
                    new_attendance.save_to_db()
                    created_records.append(new_attendance.json())
            
            response = {
                'success': True,
                'message': f'Attendance saved: {len(created_records)} created, {len(updated_records)} updated',
                'created': created_records,
                'updated': updated_records,
                'errors': errors if errors else None
            }
            return Response(json.dumps(response), 201, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error saving attendance: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'teacher'])
    def delete(self, attendance_id):
        """
        DELETE /attendance/<attendance_id> - Delete attendance record
        """
        attendance = AttendanceModel.find_by_id(attendance_id)
        
        if not attendance:
            return {'message': 'Attendance record not found'}, 404
        
        try:
            attendance.delete_from_db()
            return {
                'success': True,
                'message': 'Attendance record deleted successfully'
            }, 200
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting attendance: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')


class AttendanceRosterResource(Resource):
    """
    Get class roster for attendance taking
    """
    
    @require_any_role(['admin', 'teacher'])
    def get(self, class_id):
        """
        GET /attendance/roster/<class_id>?date=YYYY-MM-DD
        Returns list of students with their attendance status for that date
        """
        class_obj = ClassModel.find_by_id(class_id)
        if not class_obj:
            return {'message': 'Class not found'}, 404
        
        date_str = request.args.get('date')
        if not date_str:
            return {'message': 'Date parameter is required'}, 400
        
        try:
            attendance_date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400
        
        # Get students enrolled in this class
        enrollments = StudentClassModel.find_by_class_id(class_id)
        student_ids = [e.student_id for e in enrollments]
        
        # Get existing attendance records for this date
        attendance_records = AttendanceModel.find_by_class_and_date(class_id, attendance_date)
        attendance_map = {str(r.student_id): r for r in attendance_records}
        
        # Build roster
        roster = []
        for student_id in student_ids:
            student = StudentModel.find_by_id(student_id)
            if not student:
                continue
            
            attendance_record = attendance_map.get(str(student_id))
            
            roster.append({
                'student_id': str(student._id),
                'student_name': f"{student.given_name} {student.surname}",
                'status': attendance_record.status if attendance_record else 'present',
                'notes': attendance_record.notes if attendance_record else None,
                'attendance_id': str(attendance_record._id) if attendance_record else None
            })
        
        # Sort by student name
        roster.sort(key=lambda x: x['student_name'])
        
        return {
            'class_id': str(class_id),
            'class_name': class_obj.class_name,
            'date': date_str,
            'roster': roster,
            'student_count': len(roster)
        }, 200

