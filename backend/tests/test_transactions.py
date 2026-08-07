"""
Integration Tests for Authentication, Transactions, and AI Endpoints
"""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_email_otp_flow(client):
    req = await client.post("/api/v1/auth/email-otp/request", json={"email": "alex.morgan@finpilot.io"})
    assert req.status_code == 200

    verify = await client.post("/api/v1/auth/email-otp/verify", json={
        "email": "alex.morgan@finpilot.io",
        "otp_code": "123456"
    })
    assert verify.status_code == 200
    token_data = verify.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_parse_sms_endpoint(client):
    payload = {
        "sms_text": "Rs.350 debited from A/c XXXX UPI SWIGGY Ref:12345678",
        "sender": "HDFC Bank"
    }
    response = await client.post("/api/v1/transactions/parse-sms", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["transaction"]["amount"] == -350.0
    assert res["transaction"]["category"] == "Food"


@pytest.mark.asyncio
async def test_ai_chat_endpoint(client):
    response = await client.post("/api/v1/ai/chat", json={"query": "Show food expenses."})
    assert response.status_code == 200
    res = response.json()
    assert "response_markdown" in res
    assert res["action_type"] in ["category_breakdown", "general_advice", "summary"]


@pytest.mark.asyncio
async def test_dashboard_summary_endpoint(client):
    response = await client.get("/api/v1/dashboard/")
    assert response.status_code == 200
    dash = response.json()
    assert "current_balance" in dash
    assert "monthly_income" in dash
    assert "monthly_spending" in dash
