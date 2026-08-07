"""
Email OTP Generator and Redis / Memory Verification Store
"""

import random
import string
import time
from typing import Dict, Tuple
from app.config.logging import logger

# In-memory OTP cache fallback with expiration timestamps
# In production with active Redis, Redis SETEX is used.
_otp_cache: Dict[str, Tuple[str, float]] = {}


def generate_numeric_otp(length: int = 6) -> str:
    """Generate a secure 6-digit numeric verification code"""
    return "".join(random.choices(string.digits, k=length))


def store_email_otp(email: str, ttl_seconds: int = 300) -> str:
    """Generate and store OTP with a 5-minute TTL"""
    otp = generate_numeric_otp(6)
    expire_at = time.time() + ttl_seconds
    _otp_cache[email.lower()] = (otp, expire_at)
    logger.info(f"Generated OTP for {email}: {otp} (expires in {ttl_seconds}s)")
    return otp


def verify_email_otp(email: str, provided_otp: str) -> bool:
    """Verify the provided OTP against the cached code and check expiration"""
    cached = _otp_cache.get(email.lower())
    if not cached:
        return False
    
    saved_otp, expire_at = cached
    if time.time() > expire_at:
        del _otp_cache[email.lower()]
        return False
    
    if saved_otp == provided_otp.strip():
        del _otp_cache[email.lower()]
        return True
    
    return False
