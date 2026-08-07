"""
Notification & Email Transaction Parsers for Android & Ingestion
"""

import re
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.parser.sms_parser import SMSParser


class NotificationParser:
    PACKAGE_MAPPINGS = {
        "com.google.android.apps.nbu.paisa.user": "Google Pay",
        "com.phonepe.app": "PhonePe",
        "net.one97.paytm": "Paytm",
        "com.cred.club": "CRED",
        "com.csam.icici.bank.imobile": "iMobile ICICI",
        "com.hdfcbank.payzapp": "HDFC PayZapp",
        "com.chase.sig.android": "Chase Mobile"
    }

    @classmethod
    def parse(cls, package_name: str, title: str, text: str, subtext: Optional[str] = None) -> Dict[str, Any]:
        """
        Normalize Android push notification into a standard transaction.
        """
        combined = f"{title} {text} {subtext or ''}"
        parsed = SMSParser.parse(combined, sender=cls.PACKAGE_MAPPINGS.get(package_name, "App Notification"))
        
        parsed["source"] = "notification"
        parsed["app_source"] = cls.PACKAGE_MAPPINGS.get(package_name, package_name)
        return parsed


class EmailParser:
    @classmethod
    def parse(cls, sender: str, subject: str, body_text: str) -> Dict[str, Any]:
        """
        Extract transaction payload from bank e-statements and receipts.
        """
        combined = f"{subject} {body_text}"
        parsed = SMSParser.parse(combined, sender=sender)
        parsed["source"] = "email"
        return parsed
