"""
Transaction, Ingestion, and Search Schemas
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TransactionCreate(BaseModel):
    amount: float = Field(description="Transaction amount. Negative for debit/expense, positive for credit/income")
    merchant: str = Field(min_length=1, max_length=255)
    category: Optional[str] = "Others"
    currency: Optional[str] = "USD"
    payment_method: Optional[str] = "UPI"
    transaction_type: Optional[str] = "expense" # expense / income / transfer
    transaction_date: Optional[datetime] = None
    transaction_reference: Optional[str] = None
    bank_name: Optional[str] = None
    source: Optional[str] = "manual"
    notes: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    amount: float
    currency: str
    merchant: str
    category: str
    transaction_date: datetime
    payment_method: str
    transaction_type: str
    transaction_reference: Optional[str] = None
    bank_name: Optional[str] = None
    source: str
    notes: Optional[str] = None
    created_at: datetime


class TransactionFilter(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    source: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)
    sort_by: str = "transaction_date"
    sort_order: str = "desc" # desc / asc


class SMSIngestRequest(BaseModel):
    sms_text: str = Field(description="Raw incoming bank SMS text from Android device")
    sender: Optional[str] = None
    timestamp: Optional[datetime] = None


class NotificationIngestRequest(BaseModel):
    app_package_name: str = Field(description="Package identifier e.g. com.google.android.apps.nbu.paisa.user, com.phonepe.app")
    title: str
    text: str
    subtext: Optional[str] = None
    timestamp: Optional[datetime] = None


class EmailIngestRequest(BaseModel):
    sender: str
    subject: str
    body_text: str
    date: Optional[datetime] = None


class IngestionResponse(BaseModel):
    success: bool
    status: str
    transaction: Optional[TransactionResponse] = None
    parsed_data: Optional[Dict[str, Any]] = None
    message: str
