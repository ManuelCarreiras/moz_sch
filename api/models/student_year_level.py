import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db


class StudentYearLevelModel(db.Model):
    __tablename__ = 'student_year_level'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student._id'))
    level_id = db.Column(UUID(as_uuid=True), db.ForeignKey('year_level._id'))
    year_id = db.Column(UUID(as_uuid=True), db.ForeignKey('school_year._id'))
    score = db.Column(db.Float, nullable=False)

    def __init__(self, student_id, level_id, year_id, score):
        self.student_id = student_id
        self.level_id = level_id
        self.year_id = year_id
        self.score = score

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'level_id': str(self.level_id),
            'year_id': str(self.year_id),
            'score': self.score
        }

    @classmethod
    def find_by_student_id(cls, record_id):
        return cls.query.filter_by(student_id=record_id).first()

    @classmethod
    def find_by_level_id(cls, record_id):
        return cls.query.filter_by(level_id=record_id).first()

    @classmethod
    def find_by_year_id(cls, record_id):
        return cls.query.filter_by(year_id=record_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('score') is not None:
            self.score = data['score']
        self.save_to_db()

    def delete_by_level_id(self, record_id):
        obj = self.query.filter_by(level_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    def delete_by_student_id(self, record_id):
        obj = self.query.filter_by(student_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    def delete_by_year_id(self, record_id):
        obj = self.query.filter_by(year_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
