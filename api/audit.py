"""
Audit logging support: sets app.audit_user session variable at transaction start
so PostgreSQL triggers can record who made each change.
Uses app.audit_user (not app.current_user) because current_user is a PostgreSQL reserved keyword.
"""
import logging

from flask import g, has_request_context
from sqlalchemy import event, text
from sqlalchemy.orm import Session


def init_audit_listener():
    """Register Session.after_begin listener to set app.audit_user for audit triggers."""

    @event.listens_for(Session, "after_begin")
    def set_audit_user(session, transaction, connection):
        """Set app.audit_user at transaction start so triggers can capture who made changes."""
        if not has_request_context():
            return
        user = getattr(g, "user", None)
        if user is not None:
            try:
                connection.execute(text("SET LOCAL app.audit_user = :u"), {"u": str(user)})
            except Exception as e:
                logging.warning("Failed to set audit user: %s", e)
