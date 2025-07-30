# importing the necessary libraries
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


# Initializing the class class with its values
class ClassModel(db.Model):
    __tablename__ = 'class'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = db.column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    tearcher_id = db.Column(UUID(as_uuid=True), db.ForeignKey('teacher._id'), nullable=False)
    term_id = db.Column(UUID(as_uuid=True), db.ForeignKey('term._id'), nullable=False)
    start_period_id = db.Column(UUID(as_uuid=True), db.ForeignKey('period._id'), nullable=False)
    end_period_id = db.Column(UUID(as_uuid=True), db.ForeignKey('period._id'), nullable=False)
    classroom_id = db.Column(UUID(as_uuid=True), db.ForeignKey('classroom._id'), nullable=False)
    class_name = db.Column(db.String(100), nullable=False)


    
    def __init__(self, class_name):
        self.class_name = class_name


    def json(self):
        return {
            '_id': str(self._id),
            'subject_id': self.subject_id,
            'tearcher_id': self.tearcher_id,
            'term_id': self.term_id,
            'start_period_id': self.start_period_id,
            'end_period_id': self.end_period_id,
            'classroom_id': self.classroom_id,
            'class_name': self.class_name
        }
    
    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_subject_id(cls, subject_id):
        return cls.query.filter_by(subject_id=subject_id).first()

    
    @classmethod
    def find_by_tearcher_id(cls, tearcher_id):
        return cls.query.filter_by(tearcher_id=tearcher_id).first()
    
    @classmethod
    def find_by_term_id(cls, term_id):
        return cls.query.filter_by(term_id=term_id).first()
    
    @classmethod
    def find_by_start_period_id(cls, start_period_id):
        return cls.query.filter_by(start_period_id=start_period_id).first()
    
    @classmethod
    def find_by_end_period_id(cls, end_period_id):
        return cls.query.filter_by(end_period_id=end_period_id).first()
    

    @classmethod
    def find_by_classroom_id(cls, classroom_id):
        return cls.query.filter_by(classroom_id=classroom_id).first()
    
    @classmethod
    def find_by_class_name(cls, class_name):
        return cls.query.filter_by(class_name=class_name).first()
    

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



