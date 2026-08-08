"""
Unit Tests for OTP, Auth, and Analytics Engine
"""

import asyncio
from app.auth.otp import store_email_otp, verify_email_otp
from app.auth.jwt import create_access_token, decode_token
from app.auth.security import hash_password, verify_password, encrypt_sensitive_field, decrypt_sensitive_field


def test_password_hashing_and_verification():
    raw_pass = "FinPilot@2026"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_lifecycle():
    user_id = "user_uuid_12345"
    token = create_access_token(user_id, role="user")
    assert isinstance(token, str)

    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["type"] == "access"


def test_email_otp_generation_and_verification():
    email = "test.user@finpilot.io"
    otp = store_email_otp(email, ttl_seconds=300)
    assert len(otp) == 6
    assert otp.isdigit()

    assert verify_email_otp(email, otp) is True
    # Once verified, it should be consumed
    assert verify_email_otp(email, otp) is False


def test_field_level_aes_encryption():
    secret_account_no = "ACC-9481-0294-8812"
    encrypted = encrypt_sensitive_field(secret_account_no)
    assert encrypted != secret_account_no

    decrypted = decrypt_sensitive_field(encrypted)
    assert decrypted == secret_account_no
