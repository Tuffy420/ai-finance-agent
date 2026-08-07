"""
FinPilot AI - API v1 Master Router
"""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.dashboard import budget_router, analytics_router, ai_router, reports_router, dashboard_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(transactions_router)
api_v1_router.include_router(budget_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(dashboard_router)
