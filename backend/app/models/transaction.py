"""
Transaction and Ingestion Log Database Models
"""

from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Index, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin


class Transaction(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "transactions"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Financial metrics
    amount: Mapped[float] = mapped_column(Float, nullable=False, index=True) # Negative for expense, positive for income
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    
    # Merchant & Classification
    merchant: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(64), default="Others", nullable=False, index=True)
    
    # Timestamp & References
    transaction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    payment_method: Mapped[str] = mapped_column(String(64), default="UPI", nullable=False, index=True) # UPI / Card / Wallet / Bank / NetBanking
    transaction_type: Mapped[str] = mapped_column(String(32), default="expense", nullable=False, index=True) # expense / income / transfer
    
    # Unique reference & source
    transaction_reference: Mapped[Optional[str]] = mapped_column(String(128), index=True, nullable=True)
    bank_name: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source: Mapped[str] = mapped_column(String(32), default="manual", nullable=False, index=True) # sms / notification / email / manual / scan_qr
    
    # Idempotency deduplication hash (sha256 of user_id + amount + tx_date + merchant)
    idempotency_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    
    # Raw ingested text / metadata
    raw_payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    extra_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    category_rel: Mapped[Optional["Category"]] = relationship("Category", back_populates="transactions")


class ParsedSourceLog(Base, UUIDMixin, TimestampMixin):
    """
    Audit log of ingested SMS, push notifications, and email receipts.
    """
    __tablename__ = "parsed_source_logs"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False) # sms / notification / email
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_success: Mapped[bool] = mapped_column(default=True, nullable=False)
    extracted_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
