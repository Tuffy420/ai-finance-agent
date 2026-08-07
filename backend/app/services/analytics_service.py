"""
Analytics & Report Services
"""

from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.transaction import Transaction
from app.analytics.engine import AnalyticsEngine
from app.utils.export_pdf import ReportExportUtils


class AnalyticsService:
    @classmethod
    async def get_dashboard(cls, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Assemble unified dashboard payload: Net Worth, Income, Spending, Savings, Top Categories, Recent transactions.
        """
        summary = await AnalyticsEngine.compute_monthly_summary(user_id, db)
        
        # Recent 5 transactions
        stmt = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.is_deleted == False
        ).order_by(Transaction.transaction_date.desc()).limit(5)
        res = await db.execute(stmt)
        txs = list(res.scalars().all())

        return {
            "current_balance": 48920.50,
            "monthly_income": summary["total_income"],
            "monthly_spending": summary["total_spending"],
            "monthly_savings": summary["net_savings"],
            "savings_rate": f"{summary['savings_rate_percent']}%",
            "currency": "USD",
            "financial_health_score": 92,
            "active_budgets_progress": [],
            "recent_transactions": [
                {
                    "id": t.id,
                    "merchant": t.merchant,
                    "category": t.category,
                    "amount": t.amount,
                    "payment_method": t.payment_method,
                    "date": t.transaction_date.strftime("%b %d, %I:%M %p")
                } for t in txs
            ],
            "top_categories": summary["category_breakdown"]
        }


class ReportService:
    @classmethod
    async def generate_statement(cls, user_id: str, format_type: str, user_name: str, db: AsyncSession) -> Any:
        stmt = select(Transaction).where(Transaction.user_id == user_id, Transaction.is_deleted == False).limit(100)
        res = await db.execute(stmt)
        tx_models = list(res.scalars().all())
        txs = [
            {
                "id": t.id, "merchant": t.merchant, "category": t.category,
                "amount": t.amount, "currency": t.currency, "payment_method": t.payment_method,
                "date": t.transaction_date.strftime("%Y-%m-%d"), "source": t.source
            } for t in tx_models
        ]
        summary = await AnalyticsEngine.compute_monthly_summary(user_id, db)

        if format_type == "pdf":
            return ReportExportUtils.generate_pdf(user_name, "August 2026", txs, summary)
        elif format_type == "csv":
            return ReportExportUtils.generate_csv(txs)
        elif format_type == "excel":
            return ReportExportUtils.generate_excel(txs, summary)
        return None
