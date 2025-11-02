from db import db
import uuid


class AssessmentTypeModel(db.Model):
    """
    Assessment Type Model - Defines types of assignments
    Examples: Homework, Quiz, Test, Project, Lab, Presentation, Midterm, Final
    """
    __tablename__ = 'assessment_type'

    _id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type_name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    def __init__(self, type_name, description=None):
        self.type_name = type_name
        self.description = description

    def json(self):
        return {
            '_id': str(self._id),
            'type_name': self.type_name,
            'description': self.description,
            'created_date': self.created_date.isoformat() if self.created_date else None
        }

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_name(cls, type_name):
        return cls.query.filter_by(type_name=type_name).first()

    @classmethod
    def find_all(cls):
        return cls.query.all()

