import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSON
from api.db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'user'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = db.Column(db.String(20), nullable=False, default='student')
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, data=None):
        self.username = data['username'] if data and 'username' in data else None
        self.email = data['email'] if data and 'email' in data else None
        if data and 'password' in data:
            self.password = generate_password_hash(data['password'])
        else:
            self.password = None

    def json(self):
        return {
            '_id': str(self._id),
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('username') is not None:
            self.username = data['username']
        if data.get('email') is not None:
            self.email = data['email']
        if data.get('password') is not None:
            self.password = generate_password_hash(data['password'])
        self.updated_at = datetime.now()
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    def verify_password(self, password):
        return check_password_hash(self.password, password) 