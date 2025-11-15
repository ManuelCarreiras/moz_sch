from db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class GradingCriteriaModel(db.Model):
    """Simplified grading criteria - one row per subject+year_level with all component weights"""
    __tablename__ = 'grading_criteria'

    _id = db.Column('_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    year_level_id = db.Column(UUID(as_uuid=True), db.ForeignKey('year_level._id'), nullable=False)
    school_year_id = db.Column(UUID(as_uuid=True), db.ForeignKey('school_year._id'), nullable=False)
    
    # Component weights
    tests_weight = db.Column(db.Numeric(5, 2), nullable=False, default=0)
    homework_weight = db.Column(db.Numeric(5, 2), nullable=False, default=0)
    attendance_weight = db.Column(db.Numeric(5, 2), nullable=False, default=0)
    
    # Metadata
    description = db.Column(db.Text)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, subject_id, year_level_id, school_year_id, tests_weight=0, homework_weight=0, attendance_weight=0,
                 description=None, created_by=None):
        self.subject_id = subject_id
        self.year_level_id = year_level_id
        self.school_year_id = school_year_id
        self.tests_weight = tests_weight
        self.homework_weight = homework_weight
        self.attendance_weight = attendance_weight
        self.description = description
        self.created_by = created_by

    def json(self):
        return {
            '_id': str(self._id),
            'subject_id': str(self.subject_id),
            'year_level_id': str(self.year_level_id),
            'school_year_id': str(self.school_year_id),
            'tests_weight': float(self.tests_weight) if self.tests_weight else 0,
            'homework_weight': float(self.homework_weight) if self.homework_weight else 0,
            'attendance_weight': float(self.attendance_weight) if self.attendance_weight else 0,
            'total_weight': float(self.tests_weight or 0) + float(self.homework_weight or 0) + float(self.attendance_weight or 0),
            'description': self.description,
            'created_by': str(self.created_by) if self.created_by else None,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None
        }

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_subject_year_level(cls, subject_id, year_level_id, school_year_id):
        """Get criteria for a specific subject, year level, and school year"""
        return cls.query.filter_by(
            subject_id=subject_id,
            year_level_id=year_level_id,
            school_year_id=school_year_id
        ).first()

    @classmethod
    def calculate_term_grade(cls, student_id, subject_id, term_id, year_level_id, school_year_id):
        """
        Calculate term grade for a student based on grading criteria
        Pulls data from student_assignment and attendance tables
        """
        from models.student_assignment import StudentAssignmentModel
        from models.assignment import AssignmentModel
        from models.attendance import AttendanceModel
        from models.assessment_type import AssessmentTypeModel
        
        # Get grading criteria for this subject/year/school year
        criteria = cls.find_by_subject_year_level(subject_id, year_level_id, school_year_id)
        
        if not criteria:
            return None
        
        total_weighted_score = 0
        
        # Calculate Tests component (if weight > 0)
        if criteria.tests_weight > 0:
            # Get test assessment type
            test_type = AssessmentTypeModel.query.filter_by(type_name='Test').first()
            if test_type:
                student_assignments = StudentAssignmentModel.query.filter_by(
                    student_id=student_id
                ).all()
                
                test_scores = []
                for sa in student_assignments:
                    if sa.score is None or sa.status != 'graded':
                        continue
                    
                    assignment = AssignmentModel.find_by_id(sa.assignment_id)
                    if not assignment:
                        continue
                    
                    if str(assignment.subject_id) != str(subject_id):
                        continue
                    if str(assignment.term_id) != str(term_id):
                        continue
                    if str(assignment.assessment_type_id) != str(test_type._id):
                        continue
                    
                    test_scores.append({
                        'score': float(sa.score),
                        'max_score': float(assignment.max_score)
                    })
                
                if test_scores:
                    total_percentage = sum((s['score'] / s['max_score']) * 100 for s in test_scores)
                    average_percentage = total_percentage / len(test_scores)
                    component_score = (average_percentage / 100) * 20
                    total_weighted_score += component_score * (float(criteria.tests_weight) / 100)
        
        # Calculate Homework component (if weight > 0)
        # Homework is completion-based: % of homework done = grade
        if criteria.homework_weight > 0:
            homework_type = AssessmentTypeModel.query.filter_by(type_name='Homework').first()
            if homework_type:
                # Get all homework assignments for this subject/term
                all_homework = AssignmentModel.query.filter_by(
                    subject_id=subject_id,
                    term_id=term_id,
                    assessment_type_id=homework_type._id,
                    status='published'
                ).all()
                
                if all_homework:
                    total_homework = len(all_homework)
                    completed_homework = 0
                    
                    for hw in all_homework:
                        # Check if student completed this homework (has any score or is graded)
                        sa = StudentAssignmentModel.query.filter_by(
                            student_id=student_id,
                            assignment_id=hw._id
                        ).first()
                        
                        if sa and sa.status == 'graded':
                            completed_homework += 1
                    
                    # Completion percentage → converted to 0-20 scale
                    completion_percentage = (completed_homework / total_homework) * 100
                    component_score = (completion_percentage / 100) * 20
                    total_weighted_score += component_score * (float(criteria.homework_weight) / 100)
        
        # Calculate Attendance component (if weight > 0)
        if criteria.attendance_weight > 0:
            from models.term import TermModel
            term = TermModel.find_by_id(term_id)
            
            if term:
                attendances = AttendanceModel.query.filter_by(
                    student_id=student_id,
                    subject_id=subject_id
                ).filter(
                    AttendanceModel.date >= term.start_date,
                    AttendanceModel.date <= term.end_date
                ).all()
                
                if attendances:
                    present_count = sum(1 for a in attendances if a.status == 'present')
                    attendance_percentage = (present_count / len(attendances)) * 100
                    component_score = (attendance_percentage / 100) * 20
                    total_weighted_score += component_score * (float(criteria.attendance_weight) / 100)
        
        return round(total_weighted_score, 2)

    @classmethod
    def find_all(cls):
        return cls.query.all()
