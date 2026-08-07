"""
FinPilot AI - Application Configuration & Settings Management
Uses Pydantic v2 BaseSettings for environment validation and type safety.
"""

from typing import List, Optional
from pydantic import Field, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Core App Settings
    PROJECT_NAME: str = "FinPilot AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./finpilot.db",
        description="Async PostgreSQL or SQLite connection string"
    )
    SYNC_DATABASE_URL: str = Field(
        default="sqlite:///./finpilot.db",
        description="Sync database connection string for Alembic migrations"
    )
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    # Redis Cache & Rate Limiting
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    CACHE_DEFAULT_TTL: int = 300  # 5 minutes
    RATE_LIMIT_PER_MINUTE: int = 120

    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="finpilot_super_secret_jwt_encryption_key_32_chars_min",
        description="HMAC SHA-256 secret key"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Field-level Data Encryption (AES-256 Fernet)
    ENCRYPTION_KEY: str = Field(
        default="D7z1bM3bQ5r7s9v1x3z5b7d9f1h3j5l7n9p1r3t5v7x=",
        description="32-byte base64 encoded Fernet AES key"
    )

    # Google & Apple OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    APPLE_CLIENT_ID: Optional[str] = None

    # AI Providers (OpenAI / Google Gemini)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Firebase Cloud Messaging
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    # Celery Task Queue
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/2")


settings = Settings()
