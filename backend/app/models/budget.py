"""
Budget, Notification, Report, and Security Audit Database Models
"""

from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Boolean, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin, TimestampMixin


class Budget(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "budgets"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    monthly_limit: Mapped[float] = mapped_column(Float, nullable=False)
    current_spent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    
    # Target month format YYYY-MM
    month_year: Mapped[str] = mapped_column(String(7), nullable=False, index=True) # e.g. "2026-08"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Threshold alerts triggered tracking (e.g. 50, 75, 90, 100)
    last_notified_threshold: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="budgets")
    category_rel: Mapped[Optional["Category"]] = relationship("Category", back_populates="budgets")


class PushNotificationLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "push_notification_logs"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(String(1024), nullable=False)
    notification_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True) # budget_alert / large_tx / subscription / digest
    data_payload: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class GeneratedReport(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "generated_reports"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type: Mapped[str] = mapped_column(String(32), nullable=False) # pdf / csv / excel
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    period: Mapped[str] = mapped_column(String(32), nullable=False) # monthly / yearly / custom
    file_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    summary_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)


class SecurityAuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "security_audit_logs"

    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True) # login / otp_verify / transfer / export
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="success", nullable=False)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
