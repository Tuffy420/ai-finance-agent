"""
Budget Schemas for FinPilot AI
"""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BudgetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    monthly_limit: float = Field(gt=0, description="Monthly spending limit target")
    category_id: Optional[str] = None
    currency: Optional[str] = "USD"
    month_year: Optional[str] = Field(default=None, description="Format YYYY-MM, defaults to current month")


class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    category_id: Optional[str] = None
    name: str
    monthly_limit: float
    current_spent: float
    currency: str
    month_year: str
    is_active: bool
    spent_percentage: float = 0.0
    remaining_amount: float = 0.0
    status: str = "normal"  # normal / warning / exceeded
