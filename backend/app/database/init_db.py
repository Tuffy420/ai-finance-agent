"""
Database Initialization & Seeder
Creates tables and seeds default categories & demo user.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.base import Base
from app.database.session import async_engine
from app.models.user import User, UserSettings
from app.models.category import Category, MerchantRule
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.auth.security import hash_password
from app.config.logging import logger

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "slug": "Food", "icon": "utensils", "color_hex": "#7B61FF"},
    {"name": "Shopping & Tech", "slug": "Shopping", "icon": "shopping-bag", "color_hex": "#5EA1FF"},
    {"name": "Bills & Utilities", "slug": "Bills", "icon": "zap", "color_hex": "#A855F7"},
    {"name": "Travel & Fuel", "slug": "Travel", "icon": "compass", "color_hex": "#10B981"},
    {"name": "Entertainment", "slug": "Entertainment", "icon": "film", "color_hex": "#EC4899"},
    {"name": "Health & Medical", "slug": "Medical", "icon": "activity", "color_hex": "#06B6D4"},
    {"name": "Income", "slug": "Income", "icon": "trending-up", "color_hex": "#10B981"},
    {"name": "Others", "slug": "Others", "icon": "tag", "color_hex": "#6B7280"}
]


async def init_db():
    """Create all tables and seed starter data"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(async_engine) as session:
        # Seed categories if empty
        cat_res = await session.execute(select(Category))
        if not cat_res.scalars().first():
            for c in DEFAULT_CATEGORIES:
                session.add(Category(**c))
            await session.commit()
            logger.info("✅ Seeded default financial categories")

        # Seed demo user
        user_res = await session.execute(select(User).where(User.email == "alex.morgan@finpilot.io"))
        if not user_res.scalars().first():
            demo_user = User(
                email="alex.morgan@finpilot.io",
                full_name="Alex Morgan",
                phone_number="+15558392041",
                hashed_password=hash_password("FinPilot@2026"),
                is_active=True,
                is_verified=True,
                role="user"
            )
            demo_user.settings = UserSettings(
                currency="USD",
                language="en",
                dark_mode=True
            )
            session.add(demo_user)
            await session.commit()
            logger.info("✅ Seeded demo user: alex.morgan@finpilot.io")
