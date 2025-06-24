from db import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON
from flask import g


class Expense(db.Model):
    __tablename__ = 'expense'
    _id = db.Column(db.String(36), primary_key=True,default=uuid.uuid4)
    professor_id = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'), nullable=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, description, amount):
        self._id = str(uuid.uuid4())
        self.description = description
        self.amount = amount

    def json(self):
        return {
            '_id': str(self._id),
            'professor_id': str(self.professor_id),
            'description': self.description,
            'amount': self.amount,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('description') is not None:
            self.description = data['description']
        if data.get('amount') is not None:
            self.amount = data['amount']
        if data.get('date') is not None:
            self.date = data['date']
        self.updated_at = datetime.now()
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 