import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db


class ResourceModel(db.Model):
    __tablename__ = 'resource'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)  # Path in MINIO bucket
    file_size = db.Column(db.BigInteger, nullable=False)  # Size in bytes
    mime_type = db.Column(db.String(100), nullable=True)
    school_year_id = db.Column(UUID(as_uuid=True), db.ForeignKey('school_year._id'), nullable=False)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    year_level_id = db.Column(UUID(as_uuid=True), db.ForeignKey('year_level._id'), nullable=True)  # Optional year level
    uploaded_by = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'), nullable=True)  # Teacher ID (nullable for admins)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, title, file_name, file_path, file_size, school_year_id, subject_id, uploaded_by, description=None, mime_type=None, year_level_id=None):
        self.title = title
        self.description = description
        self.file_name = file_name
        self.file_path = file_path
        self.file_size = file_size
        self.mime_type = mime_type
        self.school_year_id = school_year_id
        self.subject_id = subject_id
        self.year_level_id = year_level_id
        self.uploaded_by = uploaded_by

    def json(self):
        return {
            '_id': str(self._id),
            'title': self.title,
            'description': self.description,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'school_year_id': str(self.school_year_id),
            'subject_id': str(self.subject_id),
            'year_level_id': str(self.year_level_id) if self.year_level_id else None,
            'uploaded_by': str(self.uploaded_by) if self.uploaded_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def json_with_relations(self):
        """Return resource JSON with related information"""
        from models.school_year import SchoolYearModel
        from models.subject import SubjectModel
        from models.teacher import TeacherModel
        from models.year_level import YearLevelModel
        
        resource_data = self.json()
        
        # Add school year info
        school_year = SchoolYearModel.find_by_id(self.school_year_id)
        if school_year:
            resource_data['school_year_name'] = school_year.year_name
        
        # Add subject info
        subject = SubjectModel.find_by_id(self.subject_id)
        if subject:
            resource_data['subject_name'] = subject.subject_name
        
        # Add year level info
        if self.year_level_id:
            year_level = YearLevelModel.find_by_id(self.year_level_id)
            if year_level:
                resource_data['year_level_name'] = year_level.level_name
                resource_data['year_level_order'] = year_level.level_order
        
        # Add teacher info (if uploaded_by exists)
        if self.uploaded_by:
            teacher = TeacherModel.find_by_id(self.uploaded_by)
            if teacher:
                resource_data['uploaded_by_name'] = f"{teacher.given_name} {teacher.surname}"
            else:
                resource_data['uploaded_by_name'] = 'System Admin'
        else:
            resource_data['uploaded_by_name'] = 'System Admin'
        
        return resource_data

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_school_year_id(cls, school_year_id):
        return cls.query.filter_by(school_year_id=school_year_id).all()

    @classmethod
    def find_by_subject_id(cls, subject_id):
        return cls.query.filter_by(subject_id=subject_id).all()

    @classmethod
    def find_by_school_year_and_subject(cls, school_year_id, subject_id):
        return cls.query.filter_by(school_year_id=school_year_id, subject_id=subject_id).all()

    @classmethod
    def find_by_year_level_id(cls, year_level_id):
        return cls.query.filter_by(year_level_id=year_level_id).all()

    @classmethod
    def find_by_school_year_subject_and_year_level(cls, school_year_id, subject_id, year_level_id):
        return cls.query.filter_by(
            school_year_id=school_year_id, 
            subject_id=subject_id,
            year_level_id=year_level_id
        ).all()

    @classmethod
    def find_by_uploaded_by(cls, teacher_id):
        return cls.query.filter_by(uploaded_by=teacher_id).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('title') is not None:
            self.title = data['title']
        if data.get('description') is not None:
            self.description = data['description']
        self.updated_at = datetime.utcnow()
        self.save_to_db()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

