from db import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

class Mensality(db.Model):
    __tablename__ = 'mensality'
    _id = db.Column(UUID(as_uuid=True), primary_key=True,default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, amount, due_date, paid):
        self._id = str(uuid.uuid4())
        self.amount = amount
        self.due_date = due_date
        self.paid = paid
        
    def json(self):
        return {
            '_id': str(self._id),
            'student_id': self.student_id,
            'amount': self.amount,
            'due_date': self.due_date.isoformat(),
            'paid': self.paid,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
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