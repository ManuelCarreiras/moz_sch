import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID, DATE
from db import db


class StudentMensalityModel(db.Model):
    """
    Model for tracking student monthly payments (mensality)
    Each record represents a monthly payment obligation for a student
    """
    __tablename__ = 'student_mensality'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    value = db.Column(db.Numeric(10, 2), nullable=False)  # Payment amount
    paid = db.Column(db.Boolean, nullable=False, default=False)  # Payment status
    due_date = db.Column(DATE, nullable=False)  # Payment due date
    month = db.Column(db.Integer, nullable=False)  # Month (1-12)
    year = db.Column(db.Integer, nullable=False)  # Year (e.g., 2025)
    payment_date = db.Column(DATE, nullable=True)  # Actual payment date (when paid)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)  # Optional notes about the payment

    def __init__(self, student_id, value, due_date, month, year, paid=False, payment_date=None, notes=None):
        self.student_id = student_id
        self.value = value
        self.due_date = due_date
        self.month = month
        self.year = year
        self.paid = paid
        self.payment_date = payment_date
        self.notes = notes

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'value': float(self.value) if self.value else 0.0,
            'paid': self.paid,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'month': self.month,
            'year': self.year,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes
        }

    def json_with_student(self):
        """Return mensality JSON with student information"""
        from models.student import StudentModel
        
        mensality_data = self.json()
        student = StudentModel.find_by_id(self.student_id)
        if student:
            mensality_data['student_name'] = f"{student.given_name} {student.surname}"
            mensality_data['student_email'] = student.email
        
        return mensality_data

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_student_id(cls, student_id):
        """Find all mensality records for a student"""
        return cls.query.filter_by(student_id=student_id).order_by(cls.year.desc(), cls.month.desc()).all()

    @classmethod
    def find_by_student_and_month(cls, student_id, month, year):
        """Find mensality for a specific student and month/year"""
        return cls.query.filter_by(student_id=student_id, month=month, year=year).first()

    @classmethod
    def find_unpaid(cls, student_id=None):
        """Find all unpaid mensality records, optionally filtered by student"""
        query = cls.query.filter_by(paid=False)
        if student_id:
            query = query.filter_by(student_id=student_id)
        return query.order_by(cls.due_date.asc()).all()

    @classmethod
    def find_by_month_year(cls, month, year):
        """Find all mensality records for a specific month and year"""
        return cls.query.filter_by(month=month, year=year).all()

    @classmethod
    def find_all(cls):
        return cls.query.order_by(cls.year.desc(), cls.month.desc()).all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        """Update mensality record"""
        if data.get('paid') is not None:
            self.paid = data['paid']
            # Set payment_date when marking as paid
            if data['paid'] and not self.payment_date:
                self.payment_date = date.today()
            elif not data['paid']:
                self.payment_date = None
        if data.get('payment_date') is not None:
            self.payment_date = data['payment_date']
        if data.get('value') is not None:
            self.value = data['value']
        if data.get('due_date') is not None:
            self.due_date = data['due_date']
        if data.get('notes') is not None:
            self.notes = data['notes']
        self.updated_at = datetime.utcnow()
        self.save_to_db()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

