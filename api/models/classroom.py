# importing the necessary libraries
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


# Initializing the class class with its values
class Classroom(db.Model):
    __tablename__ = 'classroom'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_type = db.column(UUID(as_uuid=True), db.ForeignKey('classroom_types._id'), nullable=False)
    room_name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.integer(3), nullable=False)


    
    def __init__(self, room_name, room_type):
        self.room_name = room_name
        self.room_type = room_type


    def json(self):
        return {
            '_id': str(self._id),
            'room_type': self.room_type,
            'room_name': self.room_name,
            'capacity': self.capacity,
        }
    
    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_room_type(cls, room_type):
        return cls.query.filter_by(room_type=room_type).first()

    
    @classmethod
    def find_by_room_name(cls, room_name):
        return cls.query.filter_by(room_name=room_name).first()
    

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('room_type') is not None:
            self.room_type = data['room_type']

        if data.get('room_name') is not None:
            self.room_name = data['room_name']
        self.save_to_db()


    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 



