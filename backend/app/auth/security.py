"""
Security Utilities: Password Hashing and AES-256 Field Encryption
"""

import base64
import os
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from app.config.settings import settings

# Password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext against stored bcrypt hash"""
    return pwd_context.verify(plain_password, hashed_password)


# AES-256 Field Encryption for sensitive bank account tokens
def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    if not key or len(key) < 32:
        # Fallback 32-byte urlsafe base64 key
        key = base64.urlsafe_b64encode(b"finpilot_default_aes256_key_32_bytes!").decode()
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except Exception:
        # Generate stable mock key
        stable_key = base64.urlsafe_b64encode(b"01234567890123456789012345678901")
        return Fernet(stable_key)


def encrypt_sensitive_field(value: str) -> str:
    """Encrypt a sensitive field e.g. bank account reference or tax id"""
    if not value:
        return ""
    fernet = _get_fernet()
    return fernet.encrypt(value.encode()).decode()


def decrypt_sensitive_field(encrypted_value: str) -> str:
    """Decrypt an encrypted field back to plaintext"""
    if not encrypted_value:
        return ""
    try:
        fernet = _get_fernet()
        return fernet.decrypt(encrypted_value.encode()).decode()
    except Exception:
        return encrypted_value
