from db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class TermGradeModel(db.Model):
    __tablename__ = 'term_grade'

    _id = db.Column('_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    term_id = db.Column(UUID(as_uuid=True), db.ForeignKey('term._id'), nullable=False)
    class_id = db.Column(UUID(as_uuid=True), db.ForeignKey('class._id'), nullable=True)
    
    # Grade values
    calculated_grade = db.Column(db.Numeric(5, 2))
    manual_override = db.Column(db.Numeric(5, 2))
    final_grade = db.Column(db.Numeric(5, 2), nullable=False)
    
    # Component breakdown
    total_weight_entered = db.Column(db.Numeric(5, 2))
    component_count = db.Column(db.Integer, default=0)
    
    # Status
    is_finalized = db.Column(db.Boolean, default=False)
    is_complete = db.Column(db.Boolean, default=False)
    
    # Metadata
    comments = db.Column(db.Text)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    finalized_by = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'))
    finalized_date = db.Column(db.DateTime)

    def __init__(self, student_id, subject_id, term_id, final_grade, 
                 class_id=None, calculated_grade=None, manual_override=None,
                 total_weight_entered=None, component_count=0,
                 is_finalized=False, is_complete=False, comments=None, created_by=None):
        self.student_id = student_id
        self.subject_id = subject_id
        self.term_id = term_id
        self.class_id = class_id
        self.calculated_grade = calculated_grade
        self.manual_override = manual_override
        self.final_grade = final_grade
        self.total_weight_entered = total_weight_entered
        self.component_count = component_count
        self.is_finalized = is_finalized
        self.is_complete = is_complete
        self.comments = comments
        self.created_by = created_by

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'subject_id': str(self.subject_id),
            'term_id': str(self.term_id),
            'class_id': str(self.class_id) if self.class_id else None,
            'calculated_grade': float(self.calculated_grade) if self.calculated_grade else None,
            'manual_override': float(self.manual_override) if self.manual_override else None,
            'final_grade': float(self.final_grade) if self.final_grade else None,
            'total_weight_entered': float(self.total_weight_entered) if self.total_weight_entered else None,
            'component_count': self.component_count,
            'is_finalized': self.is_finalized,
            'is_complete': self.is_complete,
            'comments': self.comments,
            'created_by': str(self.created_by) if self.created_by else None,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None,
            'finalized_by': str(self.finalized_by) if self.finalized_by else None,
            'finalized_date': self.finalized_date.isoformat() if self.finalized_date else None
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
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).all()

    @classmethod
    def find_by_student_subject_term(cls, student_id, subject_id, term_id):
        return cls.query.filter_by(
            student_id=student_id,
            subject_id=subject_id,
            term_id=term_id
        ).first()

    @classmethod
    def find_by_class_subject_term(cls, class_id, subject_id, term_id):
        return cls.query.filter_by(
            class_id=class_id,
            subject_id=subject_id,
            term_id=term_id
        ).all()

    @classmethod
    def find_by_term(cls, term_id):
        return cls.query.filter_by(term_id=term_id).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    @classmethod
    def calculate_and_save(cls, student_id, subject_id, term_id, class_id=None, created_by=None):
        """Calculate term grade from grade_components and save/update"""
        from models.grade_component import GradeComponentModel
        
        # Get all grade components for this student/subject/term
        components = GradeComponentModel.find_by_student_subject_term(student_id, subject_id, term_id)
        
        if not components:
            return None
        
        # Calculate weighted average
        total_weighted_score = 0
        total_weight = 0
        
        for component in components:
            percentage = (float(component.score) / float(component.max_score)) * 100
            weighted_score = percentage * float(component.weight)
            total_weighted_score += weighted_score
            total_weight += float(component.weight)
        
        if total_weight == 0:
            return None
        
        # Calculate grade on 0-20 scale
        average_percentage = total_weighted_score / total_weight
        calculated_grade = (average_percentage / 100) * 20
        calculated_grade = round(calculated_grade, 2)
        
        # Check if grade already exists
        existing_grade = cls.find_by_student_subject_term(student_id, subject_id, term_id)
        
        if existing_grade:
            # Update existing grade
            existing_grade.calculated_grade = calculated_grade
            existing_grade.total_weight_entered = total_weight
            existing_grade.component_count = len(components)
            existing_grade.is_complete = (total_weight >= 100)
            
            # Use manual override if exists, otherwise use calculated
            if existing_grade.manual_override is not None:
                existing_grade.final_grade = existing_grade.manual_override
            else:
                existing_grade.final_grade = calculated_grade
            
            existing_grade.updated_date = datetime.utcnow()
            existing_grade.save_to_db()
            return existing_grade
        else:
            # Create new grade
            new_grade = cls(
                student_id=student_id,
                subject_id=subject_id,
                term_id=term_id,
                class_id=class_id,
                calculated_grade=calculated_grade,
                final_grade=calculated_grade,
                total_weight_entered=total_weight,
                component_count=len(components),
                is_complete=(total_weight >= 100),
                created_by=created_by
            )
            new_grade.save_to_db()
            return new_grade

