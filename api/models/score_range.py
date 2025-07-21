import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db

class scoreRangeModel(db.Model):
    __tablename__ = 'score_range'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default = uuid.uuid4)
    min_score = db.Column(db.Integer, nullable=False)
    max_score = db.Column(db.Integer, nullable=False)
    grade = db.Column(db.String(100), nullable=False)

    def __init__(self, min_score, max_score, grade):
        self.min_score = min_score
        self.max_score = max_score
        self.grade = grade

        
    def json(self):
        return {
            '_id': str(self._id),
            'min_score': self.min_score,
            'max_score': self.max_score,
            'grade': self.grade
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()
    
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('min_score') is not None:
            self.min_score = data['min_score']
        if data.get('max_score') is not None:
            self.max_score = data['max_score']
        if data.get('grade') is not None:
            self.grade = data['grade']
       
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 