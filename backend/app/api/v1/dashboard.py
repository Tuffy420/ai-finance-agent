"""
Budgets, Analytics, AI Assistant, Reports, and Dashboard API Routers
"""

from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.schemas.analytics import AnalyticsSummaryResponse, DashboardPayload
from app.schemas.ai import AIChatRequest, AIChatResponse, AIInsightItem
from app.analytics.engine import AnalyticsEngine
from app.services.analytics_service import AnalyticsService, ReportService
from app.ai.assistant import AIAssistant
from app.ai.insights import AIInsightsEngine
from app.auth.dependencies import get_current_user


# =========================================================================
# BUDGETS ROUTER
# =========================================================================
budget_router = APIRouter(prefix="/budgets", tags=["Budgets"])

@budget_router.get("/", response_model=List[BudgetResponse])
async def list_budgets(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Budget).where(Budget.user_id == current_user.id, Budget.is_active == True)
    budgets = list((await db.execute(stmt)).scalars().all())
    
    if not budgets:
        # Return default budget items
        return [
            BudgetResponse(
                id="b_1", user_id=current_user.id, name="Overall Monthly Target",
                monthly_limit=5000.0, current_spent=3450.75, currency="USD",
                month_year="2026-08", is_active=True, spent_percentage=69.0, remaining_amount=1549.25, status="normal"
            ),
            BudgetResponse(
                id="b_2", user_id=current_user.id, name="Food & Dining",
                monthly_limit=1600.0, current_spent=1420.00, currency="USD",
                month_year="2026-08", is_active=True, spent_percentage=88.8, remaining_amount=180.00, status="warning"
            )
        ]

    responses = []
    for b in budgets:
        pct = (b.current_spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0
        responses.append(BudgetResponse(
            id=b.id, user_id=b.user_id, category_id=b.category_id, name=b.name,
            monthly_limit=b.monthly_limit, current_spent=b.current_spent, currency=b.currency,
            month_year=b.month_year, is_active=b.is_active, spent_percentage=round(pct, 1),
            remaining_amount=max(0, b.monthly_limit - b.current_spent),
            status="exceeded" if pct >= 100 else ("warning" if pct >= 80 else "normal")
        ))
    return responses


@budget_router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(payload: BudgetCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    month_str = payload.month_year or datetime.now(timezone.utc).strftime("%Y-%m")
    b = Budget(
        user_id=current_user.id,
        name=payload.name,
        monthly_limit=payload.monthly_limit,
        category_id=payload.category_id,
        currency=payload.currency or "USD",
        month_year=month_str
    )
    db.add(b)
    await db.flush()
    return BudgetResponse(
        id=b.id, user_id=b.user_id, category_id=b.category_id, name=b.name,
        monthly_limit=b.monthly_limit, current_spent=0.0, currency=b.currency,
        month_year=b.month_year, is_active=True, spent_percentage=0.0,
        remaining_amount=b.monthly_limit, status="normal"
    )


@budget_router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    payload: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Edit budget monthly target limit, category or name"""
    stmt = select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id)
    budget = (await db.execute(stmt)).scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget target not found")

    if payload.name is not None:
        budget.name = payload.name
    if payload.monthly_limit is not None:
        budget.monthly_limit = payload.monthly_limit
    if payload.category_id is not None:
        budget.category_id = payload.category_id
    if payload.currency is not None:
        budget.currency = payload.currency
    if payload.is_active is not None:
        budget.is_active = payload.is_active

    await db.commit()
    await db.refresh(budget)
    pct = (budget.current_spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
    return BudgetResponse(
        id=budget.id, user_id=budget.user_id, category_id=budget.category_id, name=budget.name,
        monthly_limit=budget.monthly_limit, current_spent=budget.current_spent, currency=budget.currency,
        month_year=budget.month_year, is_active=budget.is_active, spent_percentage=round(pct, 1),
        remaining_amount=max(0, budget.monthly_limit - budget.current_spent),
        status="exceeded" if pct >= 100 else ("warning" if pct >= 80 else "normal")
    )


@budget_router.delete("/{budget_id}")
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate/delete a budget target"""
    stmt = select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id)
    budget = (await db.execute(stmt)).scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget target not found")

    budget.is_active = False
    await db.commit()
    return {"success": True, "message": f"Budget target '{budget.name}' deleted successfully."}


# =========================================================================
# ANALYTICS ROUTER
# =========================================================================
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])

@analytics_router.get("/monthly", response_model=AnalyticsSummaryResponse)
async def get_monthly_analytics(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    summary = await AnalyticsEngine.compute_monthly_summary(current_user.id, db)
    return summary


# =========================================================================
# AI ROUTER
# =========================================================================
ai_router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@ai_router.post("/chat", response_model=AIChatResponse)
async def chat_with_financial_ai(payload: AIChatRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await AIAssistant.chat(current_user.id, payload.query, db)


@ai_router.get("/insights", response_model=List[AIInsightItem])
async def get_spending_insights(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    summary = await AnalyticsEngine.compute_monthly_summary(current_user.id, db)
    return AIInsightsEngine.generate_insights(summary["total_spending"], {})


# =========================================================================
# REPORTS ROUTER
# =========================================================================
reports_router = APIRouter(prefix="/reports", tags=["Reports"])

@reports_router.get("/pdf")
async def export_pdf_statement(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pdf_bytes = await ReportService.generate_statement(current_user.id, "pdf", current_user.full_name or "Alex Morgan", db)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=FinPilot_Statement.pdf"})


@reports_router.get("/csv")
async def export_csv_ledger(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    csv_str = await ReportService.generate_statement(current_user.id, "csv", current_user.full_name or "Alex Morgan", db)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=FinPilot_Ledger.csv"})


# =========================================================================
# DASHBOARD ROUTER
# =========================================================================
dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@dashboard_router.get("/", response_model=DashboardPayload)
async def get_dashboard_summary(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await AnalyticsService.get_dashboard(current_user.id, db)
