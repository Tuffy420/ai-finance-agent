"""
Transaction Service: Ingestion, Normalization, Deduplication, AI Categorization & Budget Hook
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.transaction import Transaction, ParsedSourceLog
from app.repositories.transaction_repo import TransactionRepository
from app.ai.categorizer import AICategorizer
from app.services.budget_service import BudgetService


class TransactionService:
    @classmethod
    async def process_and_save_transaction(
        cls,
        user_id: str,
        parsed_data: Dict[str, Any],
        db: AsyncSession
    ) -> Transaction:
        """
        Takes parsed transaction data, verifies idempotency deduplication hash,
        categorizes with AI, persists to PostgreSQL, and checks budget limits.
        """
        amount = float(parsed_data.get("amount", 0.0))
        merchant = parsed_data.get("merchant", "Unknown Merchant")
        tx_date_raw = parsed_data.get("transaction_date") or datetime.now(timezone.utc)
        date_str = tx_date_raw.strftime("%Y-%m-%d") if isinstance(tx_date_raw, datetime) else str(tx_date_raw)
        ref = parsed_data.get("transaction_reference")

        # 1. Idempotency Check to prevent duplicate SMS/Notification entries
        repo = TransactionRepository(db)
        idempotency_hash = repo.generate_idempotency_hash(user_id, amount, date_str, merchant, ref)
        
        existing = await repo.get_by_hash(idempotency_hash)
        if existing:
            return existing

        # 2. AI Categorization
        category_name, confidence = await AICategorizer.categorize(merchant, parsed_data.get("notes", ""))

        # 3. Create Transaction Model
        new_tx = Transaction(
            user_id=user_id,
            amount=amount,
            currency=parsed_data.get("currency", "USD"),
            merchant=merchant,
            category=category_name,
            transaction_date=tx_date_raw if isinstance(tx_date_raw, datetime) else datetime.now(timezone.utc),
            payment_method=parsed_data.get("payment_method", "UPI"),
            transaction_type=parsed_data.get("transaction_type", "expense"),
            transaction_reference=ref,
            bank_name=parsed_data.get("bank_name"),
            source=parsed_data.get("source", "sms"),
            idempotency_hash=idempotency_hash,
            raw_payload=parsed_data.get("raw_text"),
            notes=parsed_data.get("notes")
        )

        db.add(new_tx)
        await db.flush()

        # 4. Check Budget Thresholds (50%, 75%, 90%, 100%)
        if amount < 0:
            await BudgetService.evaluate_and_notify_thresholds(user_id, abs(amount), category_name, db)

        return new_tx
