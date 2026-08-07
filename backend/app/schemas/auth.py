"""
Authentication & User Pydantic v2 Schemas
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    sub: str
    role: str = "user"
    exp: int


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Minimum 8 characters password")
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class OAuthLoginRequest(BaseModel):
    provider: str = Field(pattern="^(google|apple)$")
    id_token: str
    device_type: Optional[str] = "android"
    fcm_token: Optional[str] = None


class EmailOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)
    fcm_token: Optional[str] = None


class UserSettingsUpdate(BaseModel):
    currency: Optional[str] = "USD"
    language: Optional[str] = "en"
    dark_mode: Optional[bool] = True
    enable_push_notifications: Optional[bool] = True
    enable_sms_auto_read: Optional[bool] = True
    enable_email_sync: Optional[bool] = True
    enable_biometric_lock: Optional[bool] = True
    notify_budget_thresholds: Optional[bool] = True
    notify_large_transactions: Optional[bool] = True
    large_transaction_threshold: Optional[float] = 500.0


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    role: str
    settings: Optional[UserSettingsUpdate] = None
