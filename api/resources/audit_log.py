import json

from flask import Response, request
from flask_restful import Resource

from models.audit_log import AuditLogModel
from utils.auth_middleware import require_role


class AuditLogResource(Resource):
    """Admin-only: List audit log entries with pagination."""

    @require_role('admin')
    def get(self):
        """List audit log records with pagination."""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        order_by = request.args.get('order_by', 'data')
        order_direction = request.args.get('order_direction', 'desc')

        # Validate order_by to prevent injection
        allowed_order = {'_id', 'entry_id', 'operacao', 'tabela', 'data', 'updated_by'}
        if order_by not in allowed_order:
            order_by = 'data'

        pagination = AuditLogModel.list(
            page=page,
            per_page=min(per_page, 100),  # Cap at 100 per page
            order_by=order_by,
            order_direction=order_direction
        )

        items = [item.json() for item in pagination.items]
        response = {
            'success': True,
            'items': items,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
            'page': pagination.page,
            'per_page': pagination.per_page
        }
        return Response(json.dumps(response), status=200, mimetype='application/json')
