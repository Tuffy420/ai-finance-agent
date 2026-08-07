"""
Automatic SMS Transaction Parser for Android Bank SMS Alerts
Parses Indian (UPI, HDFC, SBI, ICICI, Axis, Kotak, Paytm) and Global (Chase, BoA, Apple Card, Amex) SMS texts.
"""

import re
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.config.logging import logger


class SMSParser:
    # Common currency symbols & patterns
    CURRENCY_REGEX = r"(?:Rs\.?|INR|USD|\$|EUR|€|GBP|£)\s*([\d,]+\.?\d*)"
    REF_REGEX = r"(?:Ref(?:\s*no\.?|:)?|UPI\s*Ref(?:\s*no\.?|:)?|Txn\s*ID(?:\s*:)?|UTR(?:\s*:)?)\s*([A-Za-z0-9]+)"
    ACCOUNT_REGEX = r"(?:A/c|Account|card|ending\s*in)\s*(?:[xX*]+|no\.?\s*)(\d{3,4})"
    
    @classmethod
    def parse(cls, sms_text: str, sender: Optional[str] = None) -> Dict[str, Any]:
        """
        Extract structured transaction data from raw SMS body.
        """
        text = sms_text.strip()
        cleaned_text = re.sub(r'\s+', ' ', text)
        
        # 1. Determine Transaction Type (Debit / Expense vs Credit / Income)
        is_credit = bool(re.search(r'\b(credited|deposited|received|refunded|added)\b', cleaned_text, re.I))
        is_debit = bool(re.search(r'\b(debited|spent|paid|sent|withdrawn|charged|txn)\b', cleaned_text, re.I))
        
        tx_type = "income" if is_credit else "expense"
        
        # 2. Extract Amount
        amount = 0.0
        currency = "USD"
        
        if any(sym in cleaned_text for sym in ["Rs", "INR", "₹"]):
            currency = "INR"
        elif any(sym in cleaned_text for sym in ["$", "USD"]):
            currency = "USD"
        elif any(sym in cleaned_text for sym in ["€", "EUR"]):
            currency = "EUR"
            
        amt_match = re.search(cls.CURRENCY_REGEX, cleaned_text, re.I)
        if amt_match:
            try:
                amt_str = amt_match.group(1).replace(",", "")
                amount = float(amt_str)
            except ValueError:
                amount = 0.0
        else:
            # Fallback numeric extraction
            fallback = re.search(r'(?:debited\s*by|amount\s*of)\s*([\d,]+\.?\d*)', cleaned_text, re.I)
            if fallback:
                amount = float(fallback.group(1).replace(",", ""))

        if tx_type == "expense" and amount > 0:
            amount = -amount

        # 3. Extract Merchant / Payee
        merchant = cls._extract_merchant(cleaned_text)

        # 4. Extract Reference ID & Account
        ref_match = re.search(cls.REF_REGEX, cleaned_text, re.I)
        tx_ref = ref_match.group(1) if ref_match else None
        
        acc_match = re.search(cls.ACCOUNT_REGEX, cleaned_text, re.I)
        account_last4 = acc_match.group(1) if acc_match else None

        # 5. Extract Payment Method
        payment_method = "Card"
        if re.search(r'\b(UPI|VPA|FastPay|GPay|PhonePe|Paytm)\b', cleaned_text, re.I):
            payment_method = "UPI"
        elif re.search(r'\b(ATM|Cash|Withdrawal)\b', cleaned_text, re.I):
            payment_method = "Cash"
        elif re.search(r'\b(ACH|NEFT|RTGS|IMPS|Direct Deposit)\b', cleaned_text, re.I):
            payment_method = "Bank"
        elif re.search(r'\b(Apple Pay|Card|Visa|Mastercard|Amex)\b', cleaned_text, re.I):
            payment_method = "Card"

        # 6. Extract Bank / Sender
        bank_name = cls._extract_bank(sender or cleaned_text)

        return {
            "amount": amount,
            "currency": currency,
            "merchant": merchant,
            "payment_method": payment_method,
            "transaction_type": tx_type,
            "transaction_reference": tx_ref,
            "bank_name": bank_name,
            "account_last4": account_last4,
            "raw_text": text,
            "source": "sms",
            "transaction_date": datetime.now(timezone.utc)
        }

    @classmethod
    def _extract_merchant(cls, text: str) -> str:
        """Heuristic and regex identification of merchant name"""
        # Pattern: 'at <Merchant>' or 'to <Merchant>' or 'VPA <vpa>' or 'info <Merchant>'
        patterns = [
            r'(?:to|at|info|towards|for)\s+([A-Za-z0-9\s&.\'-]{2,30}?)(?:\s+on|\s+ref|\s+avail|\s+a/c|\s+balance|\s+date|\.|\n|$)',
            r'VPA\s+([A-Za-z0-9.\-_@]+)',
            r'(?:SWIGGY|ZOMATO|AMAZON|UBER|NETFLIX|APPLE|STARBUCKS|FLIPKART|ZEPTO|BLINKIT|APOLLO|EQUINOX)',
        ]
        for p in patterns:
            m = re.search(p, text, re.I)
            if m:
                res = m.group(1) if m.groups() else m.group(0)
                cleaned = res.strip().title()
                if len(cleaned) > 1 and cleaned.lower() not in ["the", "a", "an", "your", "account"]:
                    return cleaned
        return "Unknown Merchant"

    @classmethod
    def _extract_bank(cls, sender: str) -> str:
        s = sender.upper()
        if "HDFC" in s: return "HDFC Bank"
        if "SBI" in s: return "State Bank of India"
        if "ICICI" in s: return "ICICI Bank"
        if "AXIS" in s: return "Axis Bank"
        if "KOTAK" in s: return "Kotak Mahindra"
        if "CHASE" in s: return "Chase"
        if "BOA" in s or "BANKOFAMERICA" in s: return "Bank of America"
        if "APPLE" in s: return "Apple Card"
        return "Bank Direct"
