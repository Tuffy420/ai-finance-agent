"""
AI Assistant and Insights Schemas for FinPilot AI
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.schemas.analytics import (
    CategorySpendingItem,
    MerchantSpendingItem,
    MonthlyTrendPoint,
    AnalyticsSummaryResponse,
    DashboardPayload,
)


class AIChatRequest(BaseModel):
    query: str = Field(min_length=1, description="Natural language prompt from user")
    conversation_history: Optional[List[Dict[str, str]]] = None


class AIChatResponse(BaseModel):
    query: str
    response_markdown: str
    action_type: str = "general_advice"  # category_breakdown / overspending_alert / search_results / summary
    structured_data: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = []


class AIInsightItem(BaseModel):
    id: str
    title: str
    description: str
    insight_type: str  # warning / suggestion / opportunity / milestone
    impact_amount: Optional[float] = None
    category: Optional[str] = None
    action_button_label: Optional[str] = None
