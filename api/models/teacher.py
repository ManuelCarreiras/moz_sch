import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db

# Initializing the class gender with its values
# class Gender(Enum):
#     MALE = 'Male'
#     FEMALE = 'Female'
#     PREFER_NOT_TO_SAY = 'Prefer not to say'


class TeacherModel(db.Model):
    __tablename__ = 'professor'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    given_name = db.Column(db.String(120), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    email_address = db.Column(db.String(120), nullable=False)
    phone_number = db.Column(db.VARCHAR(20), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=True)
    # department_id removed - now using junction table for many-to-many relationship

    def __init__(self, given_name, surname, gender, email_address,
                 phone_number, username=None):
        self.given_name = given_name
        self.surname = surname
        self.gender = gender
        self.email_address = email_address
        self.phone_number = phone_number
        self.username = username

    def json(self):
        return {
            '_id': str(self._id),
            'given_name': self.given_name,
            'surname': self.surname,
            'gender': self.gender,
            'email_address': self.email_address,
            'phone_number': self.phone_number,
            'username': self.username
        }

    def json_with_departments(self):
        """Return teacher JSON with department information"""
        from models.teacher_department import TeacherDepartmentModel
        from models.department import DepartmentModel
        
        teacher_data = self.json()
        assignments = TeacherDepartmentModel.find_by_teacher_id(self._id)
        departments = []
        for assignment in assignments:
            department = DepartmentModel.find_by_id(assignment.department_id)
            if department:
                departments.append(department.json())
        teacher_data['departments'] = departments
        return teacher_data

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_given_name(cls, given_name):
        return cls.query.filter_by(given_name=given_name).first()

    @classmethod
    def find_by_surname(cls, surname):
        return cls.query.filter_by(surname=surname).first()

    @classmethod
    def find_by_email(cls, email_address):
        return cls.query.filter_by(email_address=email_address).first()
    
    @classmethod
    def find_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_department_id(cls, department_id):
        """Find teachers by department using junction table"""
        from models.teacher_department import TeacherDepartmentModel
        
        assignments = TeacherDepartmentModel.find_by_department_id(department_id)
        teachers = []
        for assignment in assignments:
            teacher = cls.find_by_id(assignment.teacher_id)
            if teacher:
                teachers.append(teacher)
        return teachers

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('given_name') is not None:
            self.given_name = data['given_name']
        if data.get('email_address') is not None:
            self.email_address = data['email_address']
        if data.get('surname') is not None:
            self.surname = data['surname']
        if data.get('phone_number') is not None:
            self.phone_number = data['phone_number']
        if data.get('username') is not None:
            self.username = data['username']
        # department_id handling removed - now managed through junction table

        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()

    @classmethod
    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()
