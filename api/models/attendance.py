from db import db
import uuid
from datetime import datetime

class AttendanceModel(db.Model):
    __tablename__ = 'attendance'

    _id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    class_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('class._id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='present')
    notes = db.Column(db.Text)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('professor._id'))
    created_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __init__(self, student_id, class_id, date, status='present', notes=None, created_by=None):
        self.student_id = student_id
        self.class_id = class_id
        self.date = date
        self.status = status
        self.notes = notes
        self.created_by = created_by

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'class_id': str(self.class_id),
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'notes': self.notes,
            'created_by': str(self.created_by) if self.created_by else None,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None
        }

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(_id=id).first()

    @classmethod
    def find_all(cls):
        return cls.query.all()
    
    @classmethod
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).order_by(cls.date.desc()).all()
    
    @classmethod
    def find_by_class_id(cls, class_id):
        return cls.query.filter_by(class_id=class_id).order_by(cls.date.desc()).all()
    
    @classmethod
    def find_by_class_and_date(cls, class_id, date):
        """Get all attendance records for a specific class on a specific date"""
        return cls.query.filter_by(class_id=class_id, date=date).all()
    
    @classmethod
    def find_by_student_class_date(cls, student_id, class_id, date):
        """Find specific attendance record"""
        return cls.query.filter_by(student_id=student_id, class_id=class_id, date=date).first()
    
    @classmethod
    def find_by_date_range(cls, start_date, end_date, student_id=None, class_id=None):
        """Find attendance records within a date range with optional filters"""
        query = cls.query.filter(cls.date >= start_date, cls.date <= end_date)
        
        if student_id:
            query = query.filter_by(student_id=student_id)
        if class_id:
            query = query.filter_by(class_id=class_id)
        
        return query.order_by(cls.date.desc()).all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

