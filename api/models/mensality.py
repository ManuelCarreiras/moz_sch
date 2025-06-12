import uuid
from datetime import datetime
from api.db import db

class Mensality(db.Model):
    __tablename__ = 'mensality'
    _id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey('student._id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, data=None):
        self.student_id = data['student_id'] if data and 'student_id' in data else None
        self.amount = data['amount'] if data and 'amount' in data else 0.0
        self.due_date = data['due_date'] if data and 'due_date' in data else datetime.now()
        self.paid = data['paid'] if data and 'paid' in data else False

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': self.student_id,
            'amount': self.amount,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid': self.paid,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('amount') is not None:
            self.amount = data['amount']
        if data.get('due_date') is not None:
            self.due_date = data['due_date']
        if data.get('paid') is not None:
            self.paid = data['paid']
        self.updated_at = datetime.now()
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 