import uuid
from datetime import date
from sqlalchemy.dialects.postgresql import UUID
from db import db
from decimal import Decimal


class StaffModel(db.Model):
    """
    Model for administrative staff members (financial, secretary, etc.)
    Each staff member has a role that determines their access permissions.
    """
    __tablename__ = 'staff'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    given_name = db.Column(db.String(120), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    email_address = db.Column(db.String(120), nullable=False, unique=True)
    phone_number = db.Column(db.VARCHAR(20), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=True)
    role = db.Column(db.String(50), nullable=False)  # 'financial', 'secretary', etc.
    hire_date = db.Column(db.Date, nullable=True)
    base_salary = db.Column(db.Numeric(10, 2), nullable=True)  # Base monthly salary

    # Valid roles for staff members
    VALID_ROLES = ['financial', 'secretary']

    def __init__(self, given_name, surname, gender, email_address,
                 phone_number, role, username=None, hire_date=None, base_salary=None):
        self.given_name = given_name
        self.surname = surname
        self.gender = gender
        self.email_address = email_address
        self.phone_number = phone_number
        self.role = role
        self.username = username
        self.hire_date = hire_date if hire_date else date.today()
        self.base_salary = Decimal(str(base_salary)) if base_salary is not None else None

    def json(self):
        return {
            '_id': str(self._id),
            'given_name': self.given_name,
            'surname': self.surname,
            'gender': self.gender,
            'email_address': self.email_address,
            'phone_number': self.phone_number,
            'username': self.username,
            'role': self.role,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'base_salary': float(self.base_salary) if self.base_salary else None
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_given_name(cls, given_name):
        return cls.query.filter_by(given_name=given_name).first()

    @classmethod
    def find_by_surname(cls, surname):
        return cls.query.filter_by(surname=surname).first()

    @classmethod
    def find_by_email(cls, email_address):
        return cls.query.filter_by(email_address=email_address).first()

    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    @classmethod
    def find_by_role(cls, role):
        """Find all staff members with a specific role"""
        return cls.query.filter_by(role=role).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if not data:
            return
        if data.get('given_name') is not None:
            self.given_name = data['given_name']
        if data.get('email_address') is not None:
            self.email_address = data['email_address']
        if data.get('surname') is not None:
            self.surname = data['surname']
        if data.get('phone_number') is not None:
            self.phone_number = data['phone_number']
        if data.get('username') is not None:
            self.username = data['username']
        if data.get('role') is not None:
            self.role = data['role']
        if data.get('hire_date') is not None:
            self.hire_date = data['hire_date']
        if data.get('base_salary') is not None:
            self.base_salary = Decimal(str(data['base_salary'])) if data['base_salary'] else None

        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    @classmethod
    def delete_from_db(cls, instance):
        db.session.delete(instance)
        db.session.commit()
