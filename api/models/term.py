import uuid
from sqlalchemy.dialects.postgresql import UUID
from db import db


class TermModel(db.Model):
    __tablename__ = 'term'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year_id = db.Column(UUID(as_uuid=True), db.ForeignKey('school_year._id'))
    term_number = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, year_id, term_number, start_date, end_date):
        self.year_id = year_id
        self.term_number = term_number
        self.start_date = start_date
        self.end_date = end_date

    def json(self):
        return {
            '_id': str(self._id),
            'year_id': self.year_id,
            'term_number': self.term_number,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat()
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_year_id(cls, year_id):
        return cls.query.filter_by(year_id=year_id).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):

        if data.get('term_number') is not None:
            self.term_number = data['term_number']
        if data.get('start_date') is not None:
            self.start_date = data['start_date']
        if data.get('end_date') is not None:
            self.end_date = data['end_date']
        self.save_to_db()

    def delete_by_id(self, record_id):
        obj = self.query.filter_by(_id=record_id).first()
        if obj:
            db.session.delete(obj)
            db.session.commit()
