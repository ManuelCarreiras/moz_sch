import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db

class PeriodModel(db.Model):
    __tablename__ = 'period'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default = uuid.uuid4)
    year_id = db.Column(UUID(as_uuid=True), nullable=False, foreign_key='school_year._id')
    name = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)


    def __init__(self, year_id, name, start_time, end_time):
        self.year_id = year_id
        self.name = name
        self.start_time = start_time
        self.end_time = end_time

        
    def json(self):
        return {
            '_id': str(self._id),
            'year_id': self.year_id,
            'name': self.name,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat()
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    @classmethod
    def find_by_year_id(cls, year_id):
        return cls.query.filter_by(year_id=year_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('name') is not None:
            self.name = data['name']
        if data.get('start_time') is not None:
            self.start_time = data['start_time']
        if data.get('end_time') is not None:
            self.end_time = data['end_time']
       
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 