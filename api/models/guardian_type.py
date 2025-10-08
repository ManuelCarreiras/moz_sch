# importing the necessary libraries
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


# Initializing the class class with its values
class GuardianTypeModel(db.Model):
    __tablename__ = 'guardian_type'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    


    
    def __init__(self, name):
        self.name = name



    def json(self):
        return {
            '_id': str(self._id),
            'name': self.name
        }
    
    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(name=name).first()
  
    @classmethod
    def find_all(cls):
        return cls.query.all()

    @classmethod
    def create_default_types(cls):
        """Create default guardian types if they don't exist"""
        default_types = [
            'Mother',
            'Father', 
            'Sister',
            'Brother',
            'Grandmother',
            'Grandfather',
            'Other'
        ]
        
        for type_name in default_types:
            existing = cls.find_by_name(type_name)
            if not existing:
                new_type = cls(name=type_name)
                new_type.save_to_db()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('name') is not None:
            self.name = data['name']

        self.save_to_db()


    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 



