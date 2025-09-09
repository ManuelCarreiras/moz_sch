# importing the necessary libraries
import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


# Initializing the class class with its values
class DepartmentModel(db.Model):
    __tablename__ = 'department'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_name = db.Column(db.String(100), nullable=False)

    def __init__(self, department_name):
        self.department_name = department_name

    def json(self):
        return {
            '_id': str(self._id),
            'department_name': self.department_name
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_department_name(cls, department_name):
        return cls.query.filter_by(department_name=department_name).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('department_name') is not None:
            self.department_name = data['department_name']

        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
