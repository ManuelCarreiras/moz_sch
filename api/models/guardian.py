import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


# Initializing the class guardian
class GuardianModel(db.Model):
    __tablename__ = 'guardian'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    given_name = db.Column(db.String(120), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    email_address = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.VARCHAR(10), unique=True, nullable=False)

    def __init__(self, given_name, surname, email_address, phone_number):
        self.given_name = given_name
        self.surname = surname
        self.email_address = email_address
        self.phone_number = phone_number

    def json(self):
        return {
            '_id': str(self._id),
            'given_name': self.given_name,
            'surname': self.surname,
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

    @classmethod
    def find_by_phone_number(cls, phone_number):
        return cls.query.filter_by(phone_number=phone_number).first()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('given_name') is not None:
            self.given_name = data['given_name']
        if data.get('email_address') is not None:
            self.email_adress = data['email_address']
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
