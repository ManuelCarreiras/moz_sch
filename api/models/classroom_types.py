import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum



# Initializing the class gender with its values
class classroom_types(db.Model):
    __tablename__ = 'classroom_types'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(120), nullable = False)


    def __init__(self, name):
        self.name = name

    def json(self):
        return {
            '_id': str(self._id),
            'name': self.name,
        }
        
    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(name=name).first()
    

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