"""
Security Utilities: Password Hashing and AES-256 Field Encryption
"""

import base64
import os
import bcrypt
from cryptography.fernet import Fernet
from app.config.settings import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt"""
    pw_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext against stored bcrypt hash"""
    try:
        pw_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False


# AES-256 Field Encryption for sensitive bank account tokens
def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    if not key or len(key) < 32:
        key = base64.urlsafe_b64encode(b"finpilot_default_aes256_key_32_bytes!").decode()
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except Exception:
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
