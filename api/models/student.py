import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


class StudentModel(db.Model):
    __tablename__ = 'student'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    given_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100), nullable=True)
    surname = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.DateTime, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    enrollment_date = db.Column(db.Date, nullable=False)

    def __init__(self, given_name, middle_name, surname, date_of_birth, gender, enrollment_date):     # noqa501
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
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,  # noqa501
            'gender': self.gender,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None  # noqa501
        }

    def json_with_year_levels(self):
        """Return student JSON with year level information"""
        from models.student_year_level import StudentYearLevelModel
        from models.year_level import YearLevelModel
        
        student_data = self.json()
        assignments = StudentYearLevelModel.find_all_by_student_id(self._id)
        year_levels = []
        for assignment in assignments:
            year_level = YearLevelModel.find_by_id(assignment.level_id)
            if year_level:
                year_levels.append(year_level.json())
        student_data['year_levels'] = year_levels
        return student_data

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_full_name(cls, given_name, middle_name=None, surname=None):
        query = cls.query
        if given_name:
            query = query.filter(cls.given_name.ilike(f'%{given_name}%'))
        if middle_name:
            query = query.filter(cls.middle_name.ilike(f'%{middle_name}%'))
        if surname:
            query = query.filter(cls.surname.ilike(f'%{surname}%'))
        return query.all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

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
