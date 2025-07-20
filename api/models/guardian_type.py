# importing the necessary libraries
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum


# Initializing the class class with its values
class guardian_type(db.Model):
    __tablename__ = 'guadian_type'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    guardian_type_name = db.Column(db.String(100), nullable=False)
    


    
    def __init__(self, guardian_type_name):
        self.guardian_type_name = guardian_type_name



    def json(self):
        return {
            '_id': str(self._id),
            'guardian_type_name': self.guardian_type_name
        }
    
    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_guardian_type_name(cls, guardian_type_name):
        return cls.query.filter_by(guardian_type_namee=guardian_type_name).first()
  

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('guardian_type_name') is not None:
            self.guardian_type_name = data['guardian_type_name']

        self.save_to_db()


    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 



