from db import db
import uuid


class AssignmentModel(db.Model):
    """
    Assignment Model - Specific assignments created by teachers
    Links to subject, class, term, and assessment type
    """
    __tablename__ = 'assignment'

    _id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    subject_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    class_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('class._id'), nullable=False)
    assessment_type_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('assessment_type._id'), nullable=False)
    term_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('term._id'), nullable=False)
    due_date = db.Column(db.TIMESTAMP)
    max_score = db.Column(db.Numeric(5, 2), nullable=False, default=100.00)
    status = db.Column(db.String(20), default='draft')  # draft, published, closed
    created_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey('professor._id'))
    updated_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    def __init__(self, title, subject_id, class_id, assessment_type_id, term_id, 
                 description=None, due_date=None, max_score=100.00, 
                 status='draft', created_by=None):
        self.title = title
        self.description = description
        self.subject_id = subject_id
        self.class_id = class_id
        self.assessment_type_id = assessment_type_id
        self.term_id = term_id
        self.due_date = due_date
        self.max_score = max_score
        self.status = status
        self.created_by = created_by

    def json(self):
        return {
            '_id': str(self._id),
            'title': self.title,
            'description': self.description,
            'subject_id': str(self.subject_id),
            'class_id': str(self.class_id),
            'assessment_type_id': str(self.assessment_type_id),
            'term_id': str(self.term_id),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'max_score': float(self.max_score) if self.max_score else 100.00,
            'status': self.status,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'created_by': str(self.created_by) if self.created_by else None,
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
    def find_by_class(cls, class_id):
        """Get all assignments for a specific class"""
        return cls.query.filter_by(class_id=class_id).all()

    @classmethod
    def find_by_teacher(cls, teacher_id):
        """Get all assignments created by a specific teacher"""
        return cls.query.filter_by(created_by=teacher_id).all()

    @classmethod
    def find_by_term(cls, term_id):
        """Get all assignments for a specific term"""
        return cls.query.filter_by(term_id=term_id).all()

    @classmethod
    def find_by_class_and_term(cls, class_id, term_id):
        """Get assignments for a specific class in a specific term"""
        return cls.query.filter_by(class_id=class_id, term_id=term_id).all()

    @classmethod
    def find_by_status(cls, status):
        """Get all assignments with a specific status"""
        return cls.query.filter_by(status=status).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

