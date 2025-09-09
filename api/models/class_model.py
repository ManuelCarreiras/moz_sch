# importing the necessary libraries
import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


# Initializing the class class with its values
class ClassModel(db.Model):
    __tablename__ = 'class'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'))
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'))
    term_id = db.Column(UUID(as_uuid=True), db.ForeignKey('term._id'))
    period_id = db.Column(UUID(as_uuid=True), db.ForeignKey('period._id'))
    classroom_id = db.Column(UUID(as_uuid=True), db.ForeignKey(
                                                'classroom._id'))
    class_name = db.Column(db.String(100), nullable=False)

    def __init__(self, subject_id, teacher_id, term_id, period_id,
                 classroom_id, class_name):
        self.subject_id = subject_id
        self.teacher_id = teacher_id
        self.term_id = term_id
        self.period_id = period_id
        self.classroom_id = classroom_id
        self.class_name = class_name

    def json(self):
        return {
            '_id': str(self._id),
            'subject_id': str(self.subject_id),
            'teacher_id': str(self.teacher_id),
            'term_id': str(self.term_id),
            'period_id': str(self.period_id),
            'classroom_id': str(self.classroom_id),
            'class_name': self.class_name
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def list_by_subject_id(cls, subject_id):
        return cls.query.filter_by(subject_id=subject_id).all()

    @classmethod
    def list_by_teacher_id(cls, teacher_id):
        return cls.query.filter_by(teacher_id=teacher_id).all()

    @classmethod
    def list_by_term_id(cls, term_id):
        return cls.query.filter_by(term_id=term_id).all()

    @classmethod
    def list_by_period_id(cls, period_id):
        return cls.query.filter_by(period_id=period_id).all()

    @classmethod
    def list_by_classroom_id(cls, classroom_id):
        return cls.query.filter_by(classroom_id=classroom_id).all()

    @classmethod
    def find_by_class_name(cls, class_name):
        return cls.query.filter_by(class_name=class_name).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('class_name') is not None:
            self.class_name = data['class_name']
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
