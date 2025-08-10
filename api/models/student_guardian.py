# importing the necessary libraries
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


# Initializing the class class with its values
class StudentGuardianModel(db.Model):
    __tablename__ = 'student_guardian'
    student_id = db.column(UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    guardian_type_id = db.Column(UUID(as_uuid=True), db.ForeignKey('guardian_type._id'), nullable=False)
    guardian_id = db.Column(UUID(as_uuid=True), db.ForeignKey('term._id'), nullable=False)

    
    def __init__(self, student_id, guardian_type_id, class_name):
        self.student_id = student_id
        self.guardian_type_id = guardian_type_id
        self.class_name = class_name


    def json(self):
        return {
            'student_id': self.student_id,
            'guardian_type_id': self.guardian_type_id,
            'guardian_id': self.guardian_id
        }

    @classmethod
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).first()

    @classmethod
    def find_by_guardian_type_id(cls, guardian_type_id):
        return cls.query.filter_by(guardian_type_id=guardian_type_id).first()


    @classmethod
    def find_by_guardian_id(cls, guardian_id):
        return cls.query.filter_by(guardian_id=guardian_id).first()


    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('class_name') is not None:
            self.class_name = data['class_name']
        self.save_to_db()


    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 



