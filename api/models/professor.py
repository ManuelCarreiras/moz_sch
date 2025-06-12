import uuid
from datetime import datetime
from api.db import db

class Professor(db.Model):
    __tablename__ = 'professor'
    _id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    class_id = db.Column(db.String(36), db.ForeignKey('class._id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, data=None):
        self.name = data['name'] if data and 'name' in data else None
        self.email = data['email'] if data and 'email' in data else None
        self.class_id = data['class_id'] if data and 'class_id' in data else None

    def json(self):
        return {
            '_id': str(self._id),
            'name': self.name,
            'email': self.email,
            'class_id': self.class_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('name') is not None:
            self.name = data['name']
        if data.get('email') is not None:
            self.email = data['email']
        if data.get('class_id') is not None:
            self.class_id = data['class_id']
        self.updated_at = datetime.now()
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 