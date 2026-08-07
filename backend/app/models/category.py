"""
Category and Merchant Rule Models
"""

from typing import Optional, List
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin, TimestampMixin


class Category(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    icon: Mapped[str] = mapped_column(String(64), default="tag", nullable=False)
    color_hex: Mapped[str] = mapped_column(String(16), default="#7B61FF", nullable=False)
    is_system_default: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="category_rel")
    budgets: Mapped[List["Budget"]] = relationship("Budget", back_populates="category_rel")


class MerchantRule(Base, UUIDMixin, TimestampMixin):
    """
    Cached and learned merchant category mapping rules for ultra-fast transaction classification.
    """
    __tablename__ = "merchant_rules"

    merchant_pattern: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    normalized_merchant: Mapped[str] = mapped_column(String(128), nullable=False)
    category_slug: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    confidence_score: Mapped[float] = mapped_column(default=1.0, nullable=False)
    source: Mapped[str] = mapped_column(String(32), default="system", nullable=False) # system / ai_learned / user_defined
