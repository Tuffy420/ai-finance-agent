"""
FinPilot AI Schemas
"""

from app.schemas.auth import (
    Token,
    TokenPayload,
    UserLoginRequest,
    UserRegisterRequest,
    UserProfileResponse,
    UserSettingsUpdate,
    RefreshTokenRequest,
    OAuthLoginRequest,
    EmailOTPRequest,
    VerifyOTPRequest,
)
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionFilter,
    SMSIngestRequest,
    NotificationIngestRequest,
    EmailIngestRequest,
    IngestionResponse,
)
from app.schemas.budget import (
    BudgetCreate,
    BudgetResponse,
)
from app.schemas.analytics import (
    CategorySpendingItem,
    MerchantSpendingItem,
    MonthlyTrendPoint,
    AnalyticsSummaryResponse,
    DashboardPayload,
)
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIInsightItem,
)
