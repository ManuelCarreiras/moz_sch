from db import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

class Class(db.Model):
    __tablename__ = 'class'
    _id = db.Column(db.String(36), primary_key=True, default=uuid.uuid4)
    class_name = db.Column(db.String(100), nullable=False)
    class_subject = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.now,
        onupdate=datetime.now
    )

    def __init__(self, class_name, class_subject, description):
        self._id = str(uuid.uuid4())
        self.class_name = class_name
        self.class_subject = class_subject
        self.description = description
        
    def json(self):
        return {
            '_id': str(self._id),
            'class_name': self.class_name,
            'class_subject': self.class_subject,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(name=name).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('class_name') is not None:
            self.name = data['class_name']
        if data.get('description') is not None:
            self.description = data['description']
        self.updated_at = datetime.now()
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 