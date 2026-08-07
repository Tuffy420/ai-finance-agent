"""
User Profile & Settings API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User, UserSettings
from app.schemas.auth import UserProfileResponse, UserSettingsUpdate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve authenticated user profile and active preferences"""
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    settings = (await db.execute(stmt)).scalar_one_or_none()
    
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        phone_number=current_user.phone_number,
        full_name=current_user.full_name or "Alex Morgan",
        avatar_url=current_user.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160",
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        role=current_user.role,
        settings=UserSettingsUpdate(
            currency=settings.currency if settings else "USD",
            language=settings.language if settings else "en",
            dark_mode=settings.dark_mode if settings else True,
            enable_push_notifications=settings.enable_push_notifications if settings else True,
            enable_sms_auto_read=settings.enable_sms_auto_read if settings else True
        )
    )


@router.put("/me/settings", response_model=UserSettingsUpdate)
async def update_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user preferences (currency, language, dark mode, SMS auto read)"""
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    settings = (await db.execute(stmt)).scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, val)

    await db.flush()
    return payload


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft delete user account and anonymize personal identifiers"""
    current_user.soft_delete()
    await db.flush()
    return None
