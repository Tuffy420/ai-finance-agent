"""
Budget Service: Tracking, Threshold Breach Analysis & Notification Triggers
"""

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.budget import Budget
from app.models.user import DeviceToken
from app.notifications.fcm import FCMNotificationService
from app.config.logging import logger


class BudgetService:
    @classmethod
    async def evaluate_and_notify_thresholds(
        cls,
        user_id: str,
        spent_increment: float,
        category: str,
        db: AsyncSession
    ) -> None:
        """
        Evaluate budget utilization on new transaction and trigger push notifications
        at 50%, 75%, 90%, and 100% capacity.
        """
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        stmt = select(Budget).where(
            Budget.user_id == user_id,
            Budget.is_active == True,
            Budget.month_year == current_month
        )
        result = await db.execute(stmt)
        budgets = list(result.scalars().all())

        for b in budgets:
            b.current_spent += spent_increment
            percent = (b.current_spent / b.monthly_limit) * 100.0 if b.monthly_limit > 0 else 0

            # Threshold ladder: 100%, 90%, 75%, 50%
            threshold_to_alert = None
            if percent >= 100 and b.last_notified_threshold < 100:
                threshold_to_alert = 100
            elif percent >= 90 and b.last_notified_threshold < 90:
                threshold_to_alert = 90
            elif percent >= 75 and b.last_notified_threshold < 75:
                threshold_to_alert = 75
            elif percent >= 50 and b.last_notified_threshold < 50:
                threshold_to_alert = 50

            if threshold_to_alert:
                b.last_notified_threshold = threshold_to_alert
                title = f"⚠️ Budget Alert: {b.name} reached {threshold_to_alert}%!"
                body = f"You have spent ${b.current_spent:,.2f} of your ${b.monthly_limit:,.2f} monthly budget cap."
                
                # Fetch user device tokens
                token_stmt = select(DeviceToken).where(DeviceToken.user_id == user_id)
                token_res = await db.execute(token_stmt)
                tokens = list(token_res.scalars().all())
                for t in tokens:
                    await FCMNotificationService.send_push(t.fcm_token, title, body, {"budget_id": b.id})
                    
        await db.flush()
