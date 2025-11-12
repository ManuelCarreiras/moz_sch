from db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class GradingCriteriaModel(db.Model):
    """Admin-defined grading criteria per subject and year level"""
    __tablename__ = 'grading_criteria'

    _id = db.Column('_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    year_level_id = db.Column(UUID(as_uuid=True), db.ForeignKey('year_level._id'), nullable=False)
    
    # Component details
    component_name = db.Column(db.String(255), nullable=False)  # "Tests", "Homework", "Attendance"
    weight = db.Column(db.Numeric(5, 2), nullable=False)  # Percentage (0-100)
    
    # Source configuration
    source_type = db.Column(db.String(50), nullable=False)  # 'assignment', 'attendance'
    assessment_type_id = db.Column(UUID(as_uuid=True), db.ForeignKey('assessment_type._id'), nullable=True)  # For assignment types
    
    # Metadata
    description = db.Column(db.Text)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, subject_id, year_level_id, component_name, weight, source_type,
                 assessment_type_id=None, description=None, created_by=None):
        self.subject_id = subject_id
        self.year_level_id = year_level_id
        self.component_name = component_name
        self.weight = weight
        self.source_type = source_type
        self.assessment_type_id = assessment_type_id
        self.description = description
        self.created_by = created_by

    def json(self):
        return {
            '_id': str(self._id),
            'subject_id': str(self.subject_id),
            'year_level_id': str(self.year_level_id),
            'component_name': self.component_name,
            'weight': float(self.weight) if self.weight else None,
            'source_type': self.source_type,
            'assessment_type_id': str(self.assessment_type_id) if self.assessment_type_id else None,
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
    def find_by_subject_year_level(cls, subject_id, year_level_id):
        """Get all criteria for a subject and year level"""
        return cls.query.filter_by(
            subject_id=subject_id,
            year_level_id=year_level_id
        ).all()

    @classmethod
    def calculate_term_grade(cls, student_id, subject_id, term_id, year_level_id):
        """
        Calculate term grade for a student based on grading criteria
        Pulls data from student_assignment and attendance tables
        """
        from models.student_assignment import StudentAssignmentModel
        from models.assignment import AssignmentModel
        from models.attendance import AttendanceModel
        
        # Get grading criteria for this subject/year
        criteria_list = cls.find_by_subject_year_level(subject_id, year_level_id)
        
        if not criteria_list:
            return None
        
        total_weighted_score = 0
        total_weight = 0
        
        for criteria in criteria_list:
            component_score = None
            
            if criteria.source_type == 'assignment':
                # Get assignments filtered by assessment_type
                student_assignments = StudentAssignmentModel.query.filter_by(
                    student_id=student_id
                ).all()
                
                filtered_assignments = []
                for sa in student_assignments:
                    if sa.score is None or sa.status != 'graded':
                        continue
                    
                    assignment = AssignmentModel.find_by_id(sa.assignment_id)
                    if not assignment:
                        continue
                    
                    # Filter by subject, term, and assessment type
                    if str(assignment.subject_id) != str(subject_id):
                        continue
                    if str(assignment.term_id) != str(term_id):
                        continue
                    if criteria.assessment_type_id and str(assignment.assessment_type_id) != str(criteria.assessment_type_id):
                        continue
                    
                    filtered_assignments.append({
                        'score': float(sa.score),
                        'max_score': float(assignment.max_score)
                    })
                
                if filtered_assignments:
                    # Calculate average on 0-20 scale
                    total_percentage = sum((a['score'] / a['max_score']) * 100 for a in filtered_assignments)
                    average_percentage = total_percentage / len(filtered_assignments)
                    component_score = (average_percentage / 100) * 20
            
            elif criteria.source_type == 'attendance':
                # Calculate attendance percentage for this subject/term
                # Get term date range
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
            
            # Apply weight if we have a score
            if component_score is not None:
                weighted_score = component_score * (float(criteria.weight) / 100)
                total_weighted_score += weighted_score
                total_weight += float(criteria.weight)
        
        if total_weight == 0:
            return None
        
        # Normalize if weights don't add up to 100%
        if total_weight != 100:
            final_grade = (total_weighted_score / total_weight) * 100 / 5
        else:
            final_grade = total_weighted_score
        
        return round(final_grade, 2)

    @classmethod
    def find_all(cls):
        return cls.query.all()

