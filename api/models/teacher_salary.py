import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID, DATE
from db import db


class TeacherSalaryModel(db.Model):
    """
    Model for tracking teacher monthly salaries
    Each record represents a monthly salary payment for a teacher
    """
    __tablename__ = 'teacher_salary'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'), nullable=False)
    value = db.Column(db.Numeric(10, 2), nullable=False)  # Salary amount
    paid = db.Column(db.Boolean, nullable=False, default=False)  # Payment status
    due_date = db.Column(DATE, nullable=False)  # Payment due date
    month = db.Column(db.Integer, nullable=False)  # Month (1-12)
    year = db.Column(db.Integer, nullable=False)  # Year (e.g., 2025)
    payment_date = db.Column(DATE, nullable=True)  # Actual payment date (when paid)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)  # Optional notes about the salary payment

    def __init__(self, teacher_id, value, due_date, month, year, paid=False, payment_date=None, notes=None):
        self.teacher_id = teacher_id
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
            'teacher_id': str(self.teacher_id),
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

    def json_with_teacher(self):
        """Return salary JSON with teacher information"""
        from models.teacher import TeacherModel
        
        salary_data = self.json()
        teacher = TeacherModel.find_by_id(self.teacher_id)
        if teacher:
            salary_data['teacher_name'] = f"{teacher.given_name} {teacher.surname}"
            salary_data['teacher_email'] = teacher.email_address
        
        return salary_data

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_teacher_id(cls, teacher_id):
        """Find all salary records for a teacher"""
        return cls.query.filter_by(teacher_id=teacher_id).order_by(cls.year.desc(), cls.month.desc()).all()

    @classmethod
    def find_by_teacher_and_month(cls, teacher_id, month, year):
        """Find salary for a specific teacher and month/year"""
        return cls.query.filter_by(teacher_id=teacher_id, month=month, year=year).first()

    @classmethod
    def find_unpaid(cls, teacher_id=None):
        """Find all unpaid salary records, optionally filtered by teacher"""
        query = cls.query.filter_by(paid=False)
        if teacher_id:
            query = query.filter_by(teacher_id=teacher_id)
        return query.order_by(cls.due_date.asc()).all()

    @classmethod
    def find_by_month_year(cls, month, year):
        """Find all salary records for a specific month and year"""
        return cls.query.filter_by(month=month, year=year).all()

    @classmethod
    def find_all(cls):
        return cls.query.order_by(cls.year.desc(), cls.month.desc()).all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        """Update salary record"""
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

