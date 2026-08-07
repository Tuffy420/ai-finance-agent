"""
FinPilot AI - Main FastAPI Application Factory
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.logging import logger
from app.database.init_db import init_db
from app.middleware.rate_limiter import RateLimiterMiddleware, global_exception_handler
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization and cleanup"""
    logger.info("🚀 Initializing FinPilot AI Backend...")
    await init_db()
    yield
    logger.info("🛑 Shutting down FinPilot AI Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-ready FastAPI backend for FinPilot AI - Autonomous Personal Finance Mobile Application.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Global CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Rate Limiter Middleware
app.add_middleware(RateLimiterMiddleware)

# Exception Handler
app.add_exception_handler(Exception, global_exception_handler)

# Mount API v1 Routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for Docker and Kubernetes liveness probes"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
