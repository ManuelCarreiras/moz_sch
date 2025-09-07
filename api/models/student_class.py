import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db


class StudentClassModel(db.Model):
    __tablename__ = 'student_class'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student._id'))
    class_id = db.Column(UUID(as_uuid=True), db.ForeignKey('class._id'))
    score = db.Column(db.Float, nullable=False)

    def __init__(self, student_id, class_id, score):
        self.student_id = student_id
        self.class_id = class_id
        self.score = score

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': self.student_id,
            'class_id': self.class_id,
            'score': self.score
        }

    @classmethod
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('score') is not None:
            self.score = data['score']

        self.save_to_db()

    def delete_by_student_id(self, student_id):
        obj = self.query.filter_by(student_id=student_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit() 

    def delete_by_class_id(self, class_id):
        obj = self.query.filter_by(class_id=class_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
