from db import db
import uuid


class StudentYearGradeModel(db.Model):
    """
    Student Year Grade Model - Cached calculated year averages
    Stores the calculated year average (0-20 scale) for each student per subject per school year
    This is the final grade that appears on report cards
    """
    __tablename__ = 'student_year_grade'

    _id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    subject_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    year_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('school_year._id'), nullable=False)
    calculated_average = db.Column(db.Numeric(4, 2))  # 0.00 to 20.00
    last_updated = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    def __init__(self, student_id, subject_id, year_id, calculated_average=None):
        self.student_id = student_id
        self.subject_id = subject_id
        self.year_id = year_id
        self.calculated_average = calculated_average

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'subject_id': str(self.subject_id),
            'year_id': str(self.year_id),
            'calculated_average': float(self.calculated_average) if self.calculated_average is not None else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
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
    def find_by_student_subject_year(cls, student_id, subject_id, year_id):
        """Find a specific student's cached grade for a subject in a school year"""
        return cls.query.filter_by(
            student_id=student_id,
            subject_id=subject_id,
            year_id=year_id
        ).first()

    @classmethod
    def find_by_student(cls, student_id):
        """Get all cached year grades for a student"""
        return cls.query.filter_by(student_id=student_id).all()

    @classmethod
    def find_by_student_and_year(cls, student_id, year_id):
        """Get all cached grades for a student in a specific school year"""
        return cls.query.filter_by(student_id=student_id, year_id=year_id).all()

    @classmethod
    def find_by_subject(cls, subject_id):
        """Get all cached grades for a specific subject"""
        return cls.query.filter_by(subject_id=subject_id).all()

    @classmethod
    def find_by_year(cls, year_id):
        """Get all cached grades for a specific school year"""
        return cls.query.filter_by(year_id=year_id).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

