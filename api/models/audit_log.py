import uuid
from datetime import datetime

from sqlalchemy import Index
from sqlalchemy.dialects.postgresql import JSONB, UUID

from db import db


class AuditLogModel(db.Model):
    __tablename__ = 'audit_log'

    _id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = db.Column(db.String(50), nullable=True)  # PK of affected row
    operacao = db.Column(db.String(50), nullable=False)  # INSERT, UPDATE, DELETE
    tabela = db.Column(db.String(50), nullable=False)
    old_data = db.Column(JSONB, nullable=True)  # Old data before operation
    new_data = db.Column(JSONB, nullable=True)  # New data after operation
    data = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_by = db.Column(db.String(50), nullable=True)

    __table_args__ = (
        Index('idx_audit_log_tabela', 'tabela'),
        Index('idx_audit_log_data', 'data'),
        Index('idx_audit_log_tabela_data', 'tabela', 'data'),
        Index('idx_audit_log_entry_id', 'entry_id'),
        Index('idx_audit_log_operacao', 'operacao'),
        Index('idx_audit_log_tabela_operacao_data', 'tabela', 'operacao', 'data'),
    )

    def __init__(self, entry_id, operacao, tabela, old_data, new_data, updated_by=None):
        self.entry_id = entry_id
        self.operacao = operacao
        self.tabela = tabela
        self.old_data = old_data
        self.new_data = new_data
        self.updated_by = updated_by or None

    def json(self):
        return {
            '_id': str(self._id),
            'entry_id': str(self.entry_id) if self.entry_id else None,
            'operacao': self.operacao,
            'tabela': self.tabela,
            'old_data': self.old_data,
            'new_data': self.new_data,
            'data': self.data.isoformat() if self.data else None,
            'updated_by': self.updated_by
        }

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(_id=id).first()

    @classmethod
    def list(cls, page=1, per_page=50, order_by='data', order_direction='desc'):
        """
        List audit log records with pagination support.

        Args:
            page (int): Page number (1-based)
            per_page (int): Number of records per page
            order_by (str): Column to order by (default: 'data')
            order_direction (str): Order direction ('asc' or 'desc')

        Returns:
            Pagination object with items and pagination metadata
        """
        query = cls.query

        # Apply ordering
        if hasattr(cls, order_by):
            order_column = getattr(cls, order_by)
            if order_direction.lower() == 'desc':
                query = query.order_by(order_column.desc())
            else:
                query = query.order_by(order_column.asc())

        # Apply pagination
        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
