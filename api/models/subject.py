# importing the necessary libraries
import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


# Initializing the class class with its values
class SubjectModel(db.Model):
    __tablename__ = 'subject'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = db.Column(UUID(as_uuid=True), db.ForeignKey(
                                                 'department._id'))
    subject_name = db.Column(db.String(100), nullable=False)
    score_range_id = db.Column(UUID(as_uuid=True), db.ForeignKey(
                                                 'score_range._id'), nullable=True)

    def __init__(self, subject_name, department_id, score_range_id=None):
        self.subject_name = subject_name
        self.department_id = department_id
        self.score_range_id = score_range_id

    def json(self):
        return {
            '_id': str(self._id),
            'department_id': str(self.department_id),
            'subject_name': self.subject_name,
            'score_range_id': str(self.score_range_id) if self.score_range_id else None
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_subject_name(cls, subject_name):
        return cls.query.filter_by(subject_name=subject_name).first()

    @classmethod
    def find_by_department_id(cls, department_id):
        return cls.query.filter_by(department_id=department_id).first()

    @classmethod
    def find_by_score_range_id(cls, score_range_id):
        return cls.query.filter_by(score_range_id=score_range_id).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('subject_name') is not None:
            self.subject_name = data['subject_name']
        if data.get('score_range_id') is not None:
            self.score_range_id = data['score_range_id']

        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
