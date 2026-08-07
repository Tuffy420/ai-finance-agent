"""
User, Transaction, Budget, and Category Repositories
"""

import hashlib
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc

from app.repositories.base import BaseRepository
from app.models.user import User, UserSettings, DeviceToken
from app.models.transaction import Transaction, ParsedSourceLog
from app.models.budget import Budget
from app.models.category import Category, MerchantRule


# =========================================================================
# USER REPOSITORY
# =========================================================================
class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        query = select(User).where(User.email == email.lower(), User.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> Optional[User]:
        query = select(User).where(User.phone_number == phone, User.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


# =========================================================================
# TRANSACTION REPOSITORY
# =========================================================================
class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)

    @staticmethod
    def generate_idempotency_hash(user_id: str, amount: float, tx_date: str, merchant: str, ref: Optional[str] = None) -> str:
        content = f"{user_id}:{amount:.2f}:{tx_date}:{merchant.lower().strip()}:{ref or ''}"
        return hashlib.sha256(content.encode()).hexdigest()

    async def get_by_hash(self, hash_str: str) -> Optional[Transaction]:
        query = select(Transaction).where(Transaction.idempotency_hash == hash_str, Transaction.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def filter_transactions(
        self,
        user_id: str,
        query_str: Optional[str] = None,
        category: Optional[str] = None,
        payment_method: Optional[str] = None,
        source: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = "transaction_date",
        sort_order: str = "desc"
    ) -> List[Transaction]:
        stmt = select(Transaction).where(Transaction.user_id == user_id, Transaction.is_deleted == False)

        if query_str:
            search = f"%{query_str.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Transaction.merchant).like(search),
                    func.lower(Transaction.category).like(search),
                    func.lower(Transaction.payment_method).like(search),
                    func.lower(Transaction.notes).like(search)
                )
            )
        if category and category != "All":
            stmt = stmt.where(Transaction.category == category)
        if payment_method and payment_method != "All":
            stmt = stmt.where(Transaction.payment_method == payment_method)
        if source:
            stmt = stmt.where(Transaction.source == source)
        if min_amount is not None:
            stmt = stmt.where(func.abs(Transaction.amount) >= min_amount)
        if max_amount is not None:
            stmt = stmt.where(func.abs(Transaction.amount) <= max_amount)
        if start_date:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.transaction_date <= end_date)

        # Sorting
        sort_col = getattr(Transaction, sort_by, Transaction.transaction_date)
        stmt = stmt.order_by(desc(sort_col) if sort_order == "desc" else asc(sort_col))
        stmt = stmt.offset(offset).limit(limit)

        result = await self.db.execute(stmt)
        return list(result.scalars().all())


# =========================================================================
# BUDGET REPOSITORY
# =========================================================================
class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: AsyncSession):
        super().__init__(Budget, db)

    async def get_user_budgets(self, user_id: str, month_year: Optional[str] = None) -> List[Budget]:
        stmt = select(Budget).where(Budget.user_id == user_id, Budget.is_active == True)
        if month_year:
            stmt = stmt.where(Budget.month_year == month_year)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


# =========================================================================
# CATEGORY & MERCHANT RULE REPOSITORY
# =========================================================================
class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: AsyncSession):
        super().__init__(Category, db)

    async def get_all_categories(self) -> List[Category]:
        result = await self.db.execute(select(Category))
        return list(result.scalars().all())

    async def match_merchant_rule(self, merchant_name: str) -> Optional[MerchantRule]:
        cleaned = merchant_name.lower().strip()
        stmt = select(MerchantRule).where(MerchantRule.merchant_pattern == cleaned)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
