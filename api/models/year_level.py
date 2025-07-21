import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db

class YearLevelModel(db.Model):
    __tablename__ = 'year_level'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default = uuid.uuid4)
    level_name = db.Column(db.String(100), nullable=False)
    level_order = db.Column(db.Integer, nullable=False)


    def __init__(self, level_name, level_order):
        self.level_name = level_name
        self.level_order = level_order

        
    def json(self):
        return {
            '_id': str(self._id),
            'level_name': self.level_name,
            'level_order': self.level_order
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_level_name(cls, level_name):
        return cls.query.filter_by(level_name=level_name).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('level_name') is not None:
            self.level_name = data['level_name']
        if data.get('level_order') is not None:
            self.level_order = data['level_order']
       
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 