"""
Unit Tests for Automatic SMS, Notification & Email Parsers
"""

import pytest
from app.parser.sms_parser import SMSParser
from app.parser.notification_parser import NotificationParser, EmailParser


def test_upi_swiggy_sms_parsing():
    sample_sms = "Rs.350 debited from A/c 4920 UPI SWIGGY Ref:12345678 on 07-Aug-26"
    parsed = SMSParser.parse(sample_sms, sender="HDFCBK")

    assert parsed["amount"] == -350.0
    assert parsed["merchant"] == "Swiggy"
    assert parsed["currency"] == "INR"
    assert parsed["payment_method"] == "UPI"
    assert parsed["transaction_reference"] == "12345678"
    assert parsed["bank_name"] == "HDFC Bank"


def test_apple_store_debit_sms():
    sample_sms = "Your Apple Card was charged $1,299.00 at Apple Store 5th Ave on Aug 07. Txn ID: AP9421"
    parsed = SMSParser.parse(sample_sms, sender="APPLE")

    assert parsed["amount"] == -1299.0
    assert "Apple Store" in parsed["merchant"]
    assert parsed["currency"] == "USD"
    assert parsed["payment_method"] == "Card"


def test_salary_credit_sms():
    sample_sms = "Rs.62,500.00 credited to Account ending in 8812 towards Bi-weekly Payroll ACH Direct Deposit."
    parsed = SMSParser.parse(sample_sms, sender="ICICIB")

    assert parsed["amount"] == 62500.0
    assert parsed["transaction_type"] == "income"


def test_google_pay_notification_parsing():
    parsed = NotificationParser.parse(
        package_name="com.google.android.apps.nbu.paisa.user",
        title="Paid to Starbucks Coffee",
        text="₹320.00 debited from HDFC Bank UPI Ref: 98765432"
    )
    assert parsed["amount"] == -320.0
    assert parsed["merchant"] == "Starbucks"
    assert parsed["payment_method"] == "UPI"
    assert parsed["source"] == "notification"
