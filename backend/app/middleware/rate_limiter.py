"""
FastAPI Middlewares: Rate Limiter & Global RFC 7807 Error Handler
"""

import time
from typing import Dict, Tuple
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.settings import settings
from app.config.logging import logger

_rate_limit_store: Dict[str, list] = {}


class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean up entries older than 60 seconds
        if client_ip not in _rate_limit_store:
            _rate_limit_store[client_ip] = []
        _rate_limit_store[client_ip] = [t for t in _rate_limit_store[client_ip] if now - t < 60]
        
        if len(_rate_limit_store[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "type": "https://finpilot.io/errors/rate-limit-exceeded",
                    "title": "Too Many Requests",
                    "status": 429,
                    "detail": "Rate limit exceeded. Please wait 60 seconds before retrying.",
                }
            )
            
        _rate_limit_store[client_ip].append(now)
        response = await call_next(request)
        return response


async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler converting unhandled exceptions to structured JSON response"""
    logger.error(f"Unhandled Exception at {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "type": "https://finpilot.io/errors/internal-server-error",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred while processing your request.",
        }
    )
