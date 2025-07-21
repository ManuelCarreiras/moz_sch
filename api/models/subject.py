# importing the necessary libraries
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


# Initializing the class class with its values
class SubjectModel(db.Model):
    __tablename__ = 'subject'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = db.column(UUID(as_uuid=True), db.ForeignKey('department._id'), nullable=False)
    subject_name = db.Column(db.String(100), nullable=False)


    
    def __init__(self, subject_name):
        self.subject_name = subject_name



    def json(self):
        return {
            '_id': str(self._id),
            'department_id': self.department_id,
            'subject_name': self.subject_name
        }
    
    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_subject_name(cls, subject_name):
        return cls.query.filter_by(subject_name=subject_name).first()
    
    @classmethod
    def find_by_department_id(cls, department_id):
        return cls.query.filter_by(department_id=department_id).first()

  

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('subject_name') is not None:
            self.subject_name = data['subject_name']

        self.save_to_db()


    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 



