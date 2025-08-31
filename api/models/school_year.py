import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from db import db


class SchoolYearModel(db.Model):
    __tablename__ = 'school_year'
    _id = db.Column(UUID(as_uuid=True), primary_key=True, default = uuid.uuid4)
    year_name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, year_name, start_date, end_date):
        self.year_name = year_name
        self.start_date = start_date
        self.end_date = end_date

    def json(self):
        return {
            '_id': str(self._id),
            'year_name': self.year_name,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat()
        }

    @classmethod
    def find_by_id(cls, _id):
        return cls.query.filter_by(_id=_id).first()

    @classmethod
    def find_by_dates(cls, start_date, end_date):
        return cls.query.filter_by(start_date=start_date, end_date=end_date).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def update_entry(self, data=None):
        if data.get('year_name') is not None:
            self.year_name = data['year_name']
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
