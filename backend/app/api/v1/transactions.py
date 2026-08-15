"""
Transactions API: Ingestion, Search, Filtering, and Normalization
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionFilter,
    SMSIngestRequest, NotificationIngestRequest, EmailIngestRequest, IngestionResponse
)
from app.repositories.transaction_repo import TransactionRepository
from app.services.transaction_service import TransactionService
from app.parser.sms_parser import SMSParser
from app.parser.notification_parser import NotificationParser, EmailParser
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/", response_model=List[TransactionResponse])
async def list_transactions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List paginated transactions for the authenticated user"""
    repo = TransactionRepository(db)
    return await repo.filter_transactions(
        user_id=current_user.id,
        category=category,
        payment_method=payment_method,
        limit=limit,
        offset=offset
    )


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually add a transaction with AI auto-categorization"""
    tx = await TransactionService.process_and_save_transaction(
        user_id=current_user.id,
        parsed_data=payload.model_dump(),
        db=db
    )
    return tx


@router.post("/parse-sms", response_model=IngestionResponse)
async def parse_and_ingest_sms(
    payload: SMSIngestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest Android Bank SMS alert, extract fields, categorize with AI, and store in PostgreSQL.
    """
    parsed = SMSParser.parse(payload.sms_text, sender=payload.sender)
    tx = await TransactionService.process_and_save_transaction(
        user_id=current_user.id,
        parsed_data=parsed,
        db=db
    )
    return IngestionResponse(
        success=True,
        status="completed",
        transaction=TransactionResponse.model_validate(tx),
        parsed_data=parsed,
        message=f"Successfully extracted ${abs(tx.amount):.2f} at {tx.merchant} categorized under {tx.category}"
    )


@router.post("/parse-notification", response_model=IngestionResponse)
async def parse_and_ingest_notification(
    payload: NotificationIngestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest Android push notification (Google Pay, PhonePe, Paytm, CRED).
    """
    parsed = NotificationParser.parse(
        package_name=payload.app_package_name,
        title=payload.title,
        text=payload.text,
        subtext=payload.subtext
    )
    tx = await TransactionService.process_and_save_transaction(
        user_id=current_user.id,
        parsed_data=parsed,
        db=db
    )
    return IngestionResponse(
        success=True,
        status="completed",
        transaction=TransactionResponse.model_validate(tx),
        parsed_data=parsed,
        message="Notification parsed and recorded"
    )


@router.post("/parse-email", response_model=IngestionResponse)
async def parse_and_ingest_email(
    payload: EmailIngestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest bank statement or e-receipt email.
    """
    parsed = EmailParser.parse(payload.sender, payload.subject, payload.body_text)
    tx = await TransactionService.process_and_save_transaction(
        user_id=current_user.id,
        parsed_data=parsed,
        db=db
    )
    return IngestionResponse(
        success=True,
        status="completed",
        transaction=TransactionResponse.model_validate(tx),
        parsed_data=parsed,
        message="Email statement parsed and recorded"
    )


@router.post("/search", response_model=List[TransactionResponse])
async def search_transactions(
    filters: TransactionFilter,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search transactions by merchant, category, amount range, payment method, date range, or source.
    """
    repo = TransactionRepository(db)
    return await repo.filter_transactions(
        user_id=current_user.id,
        query_str=filters.query,
        category=filters.category,
        payment_method=filters.payment_method,
        source=filters.source,
        min_amount=filters.min_amount,
        max_amount=filters.max_amount,
        start_date=filters.start_date,
        end_date=filters.end_date,
        limit=filters.limit,
        offset=filters.offset,
        sort_by=filters.sort_by,
        sort_order=filters.sort_order
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details of a single transaction"""
    stmt = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
        Transaction.is_deleted == False
    )
    tx = (await db.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Edit transaction details (amount, merchant, category, notes, date)"""
    stmt = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
        Transaction.is_deleted == False
    )
    tx = (await db.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if payload.amount is not None:
        tx.amount = payload.amount
    if payload.merchant is not None:
        tx.merchant = payload.merchant
    if payload.category is not None:
        tx.category = payload.category
    if payload.payment_method is not None:
        tx.payment_method = payload.payment_method
    if payload.transaction_type is not None:
        tx.transaction_type = payload.transaction_type
    if payload.transaction_date is not None:
        tx.transaction_date = payload.transaction_date
    if payload.notes is not None:
        tx.notes = payload.notes

    await db.commit()
    await db.refresh(tx)
    return tx


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft delete a transaction and recalculate financial metrics"""
    stmt = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
        Transaction.is_deleted == False
    )
    tx = (await db.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    tx.is_deleted = True
    await db.commit()
    return {
        "success": True,
        "message": f"Transaction '{tx.merchant}' (${abs(tx.amount):.2f}) deleted successfully."
    }

