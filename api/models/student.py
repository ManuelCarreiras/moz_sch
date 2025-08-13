import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db

class StudentModel(db.Model):
    __tablename__ = 'student'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default = uuid.uuid4)
    given_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100), nullable=True)
    surname = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.DateTime, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    enrollment_date = db.Column(db.Date, nullable=False)

    def __init__(self, given_name, middle_name, surname, date_of_birth, gender, enrollment_date):
        self.given_name = given_name
        self.middle_name = middle_name
        self.surname = surname
        self.date_of_birth = date_of_birth
        self.gender = gender
        self.enrollment_date = enrollment_date
        
    def json(self):
        return {
            '_id': str(self._id),
            'given_name': self.given_name,
            'middle_name': self.middle_name,
            'surname': self.surname,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('given_name') is not None:
            self.given_name = data['given_name']
        if data.get('middle_name') is not None:
            self.middle_name = data['middle_name']
        if data.get('surname') is not None:
            self.surname = data['surname']
        if data.get('date_of_birth') is not None:
            self.date_of_birth = data['date_of_birth']
        if data.get('gender') is not None:
            self.gender = data['gender']
        if data.get('enrollment_date') is not None:
            self.enrollment_date = data['enrollment_date']
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 