import uuid
from datetime import datetime
from api.db import db

class Expense(db.Model):
    __tablename__ = 'expense'
    _id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, data=None):
        self.description = data['description'] if data and 'description' in data else None
        self.amount = data['amount'] if data and 'amount' in data else 0.0
        self.date = data['date'] if data and 'date' in data else datetime.now()

    def json(self):
        return {
            '_id': str(self._id),
            'description': self.description,
            'amount': self.amount,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
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