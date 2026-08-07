"""
User, UserSettings, and DeviceToken Database Models
"""

from typing import Optional, List
from sqlalchemy import String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin


class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(32), unique=True, index=True, nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Auth Providers
    google_id: Mapped[Optional[str]] = mapped_column(String(128), unique=True, index=True, nullable=True)
    apple_id: Mapped[Optional[str]] = mapped_column(String(128), unique=True, index=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="user", nullable=False)

    # Relationships
    settings: Mapped["UserSettings"] = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    device_tokens: Mapped[List["DeviceToken"]] = relationship("DeviceToken", back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets: Mapped[List["Budget"]] = relationship("Budget", back_populates="user", cascade="all, delete-orphan")


class UserSettings(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    language: Mapped[str] = mapped_column(String(8), default="en", nullable=False)
    dark_mode: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Notification & Sync Toggles
    enable_push_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enable_sms_auto_read: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enable_email_sync: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enable_biometric_lock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Threshold preferences
    notify_budget_thresholds: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_large_transactions: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    large_transaction_threshold: Mapped[float] = mapped_column(default=500.0, nullable=False)
    
    user: Mapped["User"] = relationship("User", back_populates="settings")


class DeviceToken(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "device_tokens"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    fcm_token: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    device_type: Mapped[str] = mapped_column(String(32), default="android", nullable=False) # android / ios
    device_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="device_tokens")
