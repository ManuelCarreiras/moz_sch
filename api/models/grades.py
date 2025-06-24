import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from api.db import db

class GradesModel(db.Model):
    __tablename__ = 'grade'
    _id = db.Column(db.String(36), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.String(36), db.ForeignKey('student._id'), nullable=False)
    professor_id = db.Column(db.String(36), db.ForeignKey('professor._id'), nullable=False)
    class_id = db.Column(db.String(36), db.ForeignKey('class._id'), nullable=False)
    grade_value = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, student_id, class_id, grade_value):
        self.student_id = student_id
        self.class_id = class_id
        self.grade_value = grade_value

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': self.student_id,
            'professor_id': self.professor_id,
            'class_id': self.class_id,
            'grade_value': self.grade_value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('grade_value') is not None:
            self.grade_value = data['grade_value']
        self.updated_at = datetime.now()
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()