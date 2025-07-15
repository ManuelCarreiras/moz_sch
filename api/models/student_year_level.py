import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db

class StudentYearLevelModel(db.Model):
    __tablename__ = 'student_year_level'
    student_id = db.Column(UUID(as_uuid=True), foreign_key='student._id')
    level_id = db.Column(UUID(as_uuid=True), foreign_key='year_level._id')
    year_id = db.Column(UUID(as_uuid=True), foreign_key='school_year._id')


    def __init__(self, student_id, level_id, year_id):
        self.student_id = student_id
        self.level_id = level_id
        self.year_id = year_id

        
    def json(self):
        return {
            'student_id': self.student_id,
            'level_id': self.level_id,
            'year_id': self.year_id
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).first()
    
    @classmethod
    def find_by_level_id(cls, level_id):
        return cls.query.filter_by(level_id=level_id).first()
    
    @classmethod
    def find_by_year_id(cls, year_id):
        return cls.query.filter_by(year_id=year_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('student_id') is not None:
            self.student_id = data['student_id']
        if data.get('level_id') is not None:
            self.level_id = data['level_id']
        if data.get('year_id') is not None:
            self.year_id = data['year_id']
       
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 