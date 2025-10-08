from db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid


class TeacherDepartmentModel(db.Model):
    __tablename__ = 'teacher_department'

    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'), nullable=False)
    department_id = db.Column(UUID(as_uuid=True), db.ForeignKey('department._id'), nullable=False)

    def __init__(self, teacher_id, department_id):
        self.teacher_id = teacher_id
        self.department_id = department_id

    def json(self):
        return {
            '_id': str(self._id),
            'teacher_id': str(self.teacher_id),
            'department_id': str(self.department_id)
        }

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_id(cls, record_id):
        return cls.query.filter_by(_id=record_id).first()

    @classmethod
    def find_by_teacher_id(cls, teacher_id):
        return cls.query.filter_by(teacher_id=teacher_id).all()

    @classmethod
    def find_by_department_id(cls, department_id):
        return cls.query.filter_by(department_id=department_id).all()

    @classmethod
    def find_by_teacher_and_department(cls, teacher_id, department_id):
        return cls.query.filter_by(teacher_id=teacher_id, department_id=department_id).first()

    @classmethod
    def delete_by_teacher_and_department(cls, teacher_id, department_id):
        assignment = cls.find_by_teacher_and_department(teacher_id, department_id)
        if assignment:
            db.session.delete(assignment)
            db.session.commit()
            return True
        return False

    @classmethod
    def delete_by_id(cls, record_id):
        obj = cls.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    def update_entry(self, data):
        if 'teacher_id' in data:
            self.teacher_id = data['teacher_id']
        if 'department_id' in data:
            self.department_id = data['department_id']
        self.save_to_db()
