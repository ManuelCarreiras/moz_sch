import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum

# Initializing the class gender with its values
# class Gender(Enum):
#     MALE = 'Male'
#     FEMALE = 'Female'
#     PREFER_NOT_TO_SAY = 'Prefer not to say'


class TeacherModel(db.Model):
    __tablename__ = 'professor'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    given_name = db.Column(db.String(120), nullable = False)
    surname = db.Column(db.String(100), nullable = False)
    gender = db.Column(db.String(10), nullable=False)
    email_address = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.VARCHAR(10), unique=True, nullable=False)

    def __init__(self, given_name, surname, gender, email_address, phone_number):
        self.given_name = given_name
        self.surname = surname
        self.gender = gender
        self.email_address = email_address
        self.phone_number = phone_number

    def json(self):
        return {
            '_id': str(self._id),
            'given_name': self.given_name,
            'surname': self.surname,
            'gender': self.gender,
            'email_address': self.email_address,
            'phone_number': self.phone_number
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

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('given_name') is not None:
            self.given_name = data['given_name']
        if data.get('email_address') is not None:
            self.email = data['email_address']
        if data.get('surname') is not None:
            self.surname = data['surname']
        if data.get('phone_number') is not None:
            self.phone_number = data['phone_number']

        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()
