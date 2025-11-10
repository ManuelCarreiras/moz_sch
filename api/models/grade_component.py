from db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class GradeComponentModel(db.Model):
    __tablename__ = 'grade_component'

    _id = db.Column('_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student._id'), nullable=False)
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subject._id'), nullable=False)
    term_id = db.Column(UUID(as_uuid=True), db.ForeignKey('term._id'), nullable=False)
    class_id = db.Column(UUID(as_uuid=True), db.ForeignKey('class._id'), nullable=True)
    
    # Component details
    component_type = db.Column(db.String(50), nullable=False)
    component_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Source and calculation
    source_type = db.Column(db.String(50), default='manual')  # 'manual', 'auto_calculated', 'attendance'
    assignment_ids = db.Column(db.ARRAY(UUID(as_uuid=True)))  # For auto_calculated components
    auto_calculate = db.Column(db.Boolean, default=False)
    
    # Score
    score = db.Column(db.Numeric(5, 2), nullable=False)
    max_score = db.Column(db.Numeric(5, 2), default=20.0)
    weight = db.Column(db.Numeric(5, 2), nullable=False)
    
    # Metadata
    notes = db.Column(db.Text)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('professor._id'))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, student_id, subject_id, term_id, component_type, component_name, 
                 score, weight, class_id=None, description=None, max_score=20.0, 
                 source_type='manual', assignment_ids=None, auto_calculate=False,
                 notes=None, created_by=None):
        self.student_id = student_id
        self.subject_id = subject_id
        self.term_id = term_id
        self.class_id = class_id
        self.component_type = component_type
        self.component_name = component_name
        self.description = description
        self.source_type = source_type
        self.assignment_ids = assignment_ids
        self.auto_calculate = auto_calculate
        self.score = score
        self.max_score = max_score
        self.weight = weight
        self.notes = notes
        self.created_by = created_by

    def json(self):
        return {
            '_id': str(self._id),
            'student_id': str(self.student_id),
            'subject_id': str(self.subject_id),
            'term_id': str(self.term_id),
            'class_id': str(self.class_id) if self.class_id else None,
            'component_type': self.component_type,
            'component_name': self.component_name,
            'description': self.description,
            'source_type': self.source_type,
            'assignment_ids': [str(aid) for aid in self.assignment_ids] if self.assignment_ids else [],
            'auto_calculate': self.auto_calculate,
            'score': float(self.score) if self.score else None,
            'max_score': float(self.max_score) if self.max_score else None,
            'weight': float(self.weight) if self.weight else None,
            'notes': self.notes,
            'created_by': str(self.created_by) if self.created_by else None,
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
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).all()

    @classmethod
    def find_by_student_subject_term(cls, student_id, subject_id, term_id):
        return cls.query.filter_by(
            student_id=student_id,
            subject_id=subject_id,
            term_id=term_id
        ).all()

    @classmethod
    def find_by_class_subject_term(cls, class_id, subject_id, term_id):
        return cls.query.filter_by(
            class_id=class_id,
            subject_id=subject_id,
            term_id=term_id
        ).all()

    @classmethod
    def find_all(cls):
        return cls.query.all()

    @classmethod
    def get_total_weight_for_student_subject_term(cls, student_id, subject_id, term_id):
        """Calculate total weight of all components for a student/subject/term"""
        components = cls.find_by_student_subject_term(student_id, subject_id, term_id)
        return sum(float(c.weight) for c in components)

    @classmethod
    def calculate_weighted_average(cls, student_id, subject_id, term_id):
        """Calculate weighted average grade for a student in a subject for a term"""
        components = cls.find_by_student_subject_term(student_id, subject_id, term_id)
        
        if not components:
            return None
        
        total_weighted_score = 0
        total_weight = 0
        
        for component in components:
            # Calculate percentage
            percentage = (float(component.score) / float(component.max_score)) * 100
            # Apply weight
            weighted_score = percentage * float(component.weight)
            total_weighted_score += weighted_score
            total_weight += float(component.weight)
        
        if total_weight == 0:
            return None
        
        # Convert to 0-20 scale
        average_percentage = total_weighted_score / total_weight
        average_20_scale = (average_percentage / 100) * 20
        
        return round(average_20_scale, 2)

    @classmethod
    def auto_create_from_assignments(cls, student_id, subject_id, term_id, class_id=None, created_by=None):
        """
        Auto-create or update grade components from student assignments
        Groups assignments by assessment_type and creates components
        """
        from models.student_assignment import StudentAssignmentModel
        from models.assignment import AssignmentModel
        
        # Get all graded assignments for this student/subject/term
        student_assignments = StudentAssignmentModel.query.filter_by(
            student_id=student_id
        ).all()
        
        # Filter by subject and term
        filtered_assignments = []
        for sa in student_assignments:
            if sa.score is None:
                continue  # Skip ungraded assignments
            
            assignment = AssignmentModel.find_by_id(sa.assignment_id)
            if not assignment:
                continue
            
            if str(assignment.subject_id) != str(subject_id):
                continue
            if str(assignment.term_id) != str(term_id):
                continue
            
            filtered_assignments.append({
                'sa': sa,
                'assignment': assignment
            })
        
        if not filtered_assignments:
            return []
        
        # Group by assessment_type
        from models.assessment_type import AssessmentTypeModel
        grouped = {}
        
        for item in filtered_assignments:
            assignment = item['assignment']
            sa = item['sa']
            
            # Get assessment type
            assessment_type = AssessmentTypeModel.find_by_id(assignment.assessment_type_id)
            type_name = assessment_type.type_name if assessment_type else 'Other'
            
            if type_name not in grouped:
                grouped[type_name] = []
            
            grouped[type_name].append({
                'assignment_id': str(assignment._id),
                'score': float(sa.score),
                'max_score': float(assignment.max_score),
                'weight': float(assignment.weight)
            })
        
        # Create/update components for each type
        created_components = []
        
        for type_name, assignments in grouped.items():
            # Calculate average score for this type
            total_weighted = 0
            total_weight = 0
            assignment_ids = []
            
            for assg in assignments:
                percentage = (assg['score'] / assg['max_score']) * 100
                weighted = percentage * assg['weight']
                total_weighted += weighted
                total_weight += assg['weight']
                assignment_ids.append(assg['assignment_id'])
            
            if total_weight > 0:
                average_percentage = total_weighted / total_weight
                average_20_scale = (average_percentage / 100) * 20
                
                # Check if component already exists
                component_name = f"{type_name} Average"
                existing = cls.query.filter_by(
                    student_id=student_id,
                    subject_id=subject_id,
                    term_id=term_id,
                    component_name=component_name
                ).first()
                
                if existing and existing.auto_calculate:
                    # Update existing auto-calculated component
                    existing.score = round(average_20_scale, 2)
                    existing.assignment_ids = [uuid.UUID(aid) for aid in assignment_ids]
                    existing.updated_date = datetime.utcnow()
                    existing.save_to_db()
                    created_components.append(existing)
                elif not existing:
                    # Create new auto-calculated component
                    # Note: weight is NOT set automatically - teacher must set it
                    # This just creates the component with a default weight of 0
                    component = cls(
                        student_id=student_id,
                        subject_id=subject_id,
                        term_id=term_id,
                        class_id=class_id,
                        component_type=type_name.lower(),
                        component_name=component_name,
                        description=f"Auto-calculated from {len(assignments)} {type_name.lower()} assignment(s)",
                        source_type='auto_calculated',
                        assignment_ids=[uuid.UUID(aid) for aid in assignment_ids],
                        auto_calculate=True,
                        score=round(average_20_scale, 2),
                        max_score=20.0,
                        weight=0,  # Teacher must set weight manually
                        created_by=created_by
                    )
                    component.save_to_db()
                    created_components.append(component)
        
        return created_components

