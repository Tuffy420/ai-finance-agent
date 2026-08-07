"""
Analytics and Dashboard Schemas for FinPilot AI
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.schemas.budget import BudgetResponse


class CategorySpendingItem(BaseModel):
    category: str
    total_spent: float
    transaction_count: int
    percentage: float
    color_hex: str
    icon: str


class MerchantSpendingItem(BaseModel):
    merchant: str
    total_spent: float
    transaction_count: int
    category: str


class MonthlyTrendPoint(BaseModel):
    period: str
    income: float
    expense: float
    savings: float
    savings_rate: float


class AnalyticsSummaryResponse(BaseModel):
    period: str
    total_income: float
    total_spending: float
    net_savings: float
    savings_rate_percent: float
    average_daily_spending: float
    highest_transaction: Optional[Dict[str, Any]] = None
    lowest_transaction: Optional[Dict[str, Any]] = None
    spending_growth_vs_previous_percent: float
    category_breakdown: List[CategorySpendingItem]
    top_merchants: List[MerchantSpendingItem]
    trend_series: List[MonthlyTrendPoint]


class DashboardPayload(BaseModel):
    current_balance: float
    monthly_income: float
    monthly_spending: float
    monthly_savings: float
    savings_rate: str
    currency: str
    financial_health_score: int
    active_budgets_progress: List[BudgetResponse]
    recent_transactions: List[Any]
    top_categories: List[CategorySpendingItem]
