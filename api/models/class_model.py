# importing the necessary libraries
import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


# Initializing the class class with its values
class ClassModel(db.Model):
    __tablename__ = 'class'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=True)
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'), nullable=True)
    term_id = db.Column(UUID(as_uuid=True), db.ForeignKey('term._id'), nullable=False)
    period_id = db.Column(UUID(as_uuid=True), db.ForeignKey('period._id'), nullable=True)
    day_of_week = db.Column(db.Integer, nullable=True)  # 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday
    classroom_id = db.Column(UUID(as_uuid=True), db.ForeignKey('classroom._id'), nullable=True)
    year_level_id = db.Column(UUID(as_uuid=True), db.ForeignKey('year_level._id'), nullable=False)
    class_name = db.Column(db.String(100), nullable=False)
    
    # Ensure same year level cannot have same period twice (already enforced at DB level)

    def __init__(self, term_id, year_level_id, class_name, subject_id=None, teacher_id=None, period_id=None, day_of_week=None, classroom_id=None):
        self.subject_id = subject_id
        self.teacher_id = teacher_id
        self.term_id = term_id
        self.period_id = period_id
        self.day_of_week = day_of_week
        self.classroom_id = classroom_id
        self.year_level_id = year_level_id
        self.class_name = class_name

    def json(self):
        return {
            '_id': str(self._id),
            'subject_id': str(self.subject_id) if self.subject_id else None,
            'teacher_id': str(self.teacher_id) if self.teacher_id else None,
            'term_id': str(self.term_id),
            'period_id': str(self.period_id) if self.period_id else None,
            'day_of_week': self.day_of_week,
            'classroom_id': str(self.classroom_id) if self.classroom_id else None,
            'year_level_id': str(self.year_level_id),
            'class_name': self.class_name
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def list_by_subject_id(cls, subject_id):
        return cls.query.filter_by(subject_id=subject_id).all()

    @classmethod
    def list_by_teacher_id(cls, teacher_id):
        return cls.query.filter_by(teacher_id=teacher_id).all()

    @classmethod
    def list_by_term_id(cls, term_id):
        return cls.query.filter_by(term_id=term_id).all()

    @classmethod
    def list_by_period_id(cls, period_id):
        return cls.query.filter_by(period_id=period_id).all()

    @classmethod
    def list_by_classroom_id(cls, classroom_id):
        return cls.query.filter_by(classroom_id=classroom_id).all()

    @classmethod
    def find_by_class_name(cls, class_name):
        return cls.query.filter_by(class_name=class_name).first()
    
    @classmethod
    def find_by_year_level_and_period(cls, year_level_id, period_id):
        return cls.query.filter_by(year_level_id=year_level_id, period_id=period_id).first()
    
    @classmethod
    def find_by_year_level_period_and_day(cls, year_level_id, period_id, day_of_week):
        return cls.query.filter_by(year_level_id=year_level_id, period_id=period_id, day_of_week=day_of_week).first()
    
    @classmethod
    def find_by_year_level(cls, year_level_id):
        return cls.query.filter_by(year_level_id=year_level_id).all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('subject_id') is not None:
            self.subject_id = data['subject_id']
        if data.get('teacher_id') is not None:
            self.teacher_id = data['teacher_id']
        if data.get('term_id') is not None:
            self.term_id = data['term_id']
        if data.get('period_id') is not None:
            self.period_id = data['period_id']
        if data.get('day_of_week') is not None:
            self.day_of_week = data['day_of_week']
        if data.get('classroom_id') is not None:
            self.classroom_id = data['classroom_id']
        if data.get('year_level_id') is not None:
            self.year_level_id = data['year_level_id']
        if data.get('class_name') is not None:
            self.class_name = data['class_name']
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
