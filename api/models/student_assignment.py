from db import db
import uuid


class StudentAssignmentModel(db.Model):
    """
    Student Assignment Model - Individual student grades for assignments
    Links students to assignments with scores and feedback
    """
    __tablename__ = 'student_assignment'

    _id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    assignment_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('assignment._id'), nullable=False)
    score = db.Column(db.Numeric(5, 2))
    submission_date = db.Column(db.TIMESTAMP)
    graded_date = db.Column(db.TIMESTAMP)
    feedback = db.Column(db.Text)
    status = db.Column(db.String(20), default='not_submitted')  # not_submitted, submitted, graded, late
    created_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    def __init__(self, student_id, assignment_id, score=None, submission_date=None,
                 graded_date=None, feedback=None, status='not_submitted'):
        self.student_id = student_id
        self.assignment_id = assignment_id
        self.score = score
        self.submission_date = submission_date
        self.graded_date = graded_date
        self.feedback = feedback
        self.status = status

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'assignment_id': str(self.assignment_id),
            'score': float(self.score) if self.score is not None else None,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'graded_date': self.graded_date.isoformat() if self.graded_date else None,
            'feedback': self.feedback,
            'status': self.status,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None
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
    def find_by_student_and_assignment(cls, student_id, assignment_id):
        """Find a specific student's grade for an assignment"""
        return cls.query.filter_by(student_id=student_id, assignment_id=assignment_id).first()

    @classmethod
    def find_by_student(cls, student_id):
        """Get all grades for a specific student"""
        return cls.query.filter_by(student_id=student_id).all()

    @classmethod
    def find_by_assignment(cls, assignment_id):
        """Get all student grades for a specific assignment"""
        return cls.query.filter_by(assignment_id=assignment_id).all()

    @classmethod
    def find_graded_by_student(cls, student_id):
        """Get all graded assignments for a student"""
        return cls.query.filter_by(student_id=student_id, status='graded').all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

