"""
AI Transaction Categorization Engine
Features fast heuristic rule matching + LLM fallback (OpenAI / Gemini) with learned rule caching.
"""

from typing import Tuple
from app.config.settings import settings
from app.config.logging import logger

# Static Rule Base for ultra-fast zero-latency classification
STATIC_CATEGORY_MAP = {
    # Food & Dining
    "swiggy": "Food", "zomato": "Food", "starbucks": "Food", "mcdonalds": "Food",
    "dominos": "Food", "subway": "Food", "blue bottle": "Food", "nobu": "Food",
    "whole foods": "Food", "trader joes": "Food", "kroger": "Food", "instacart": "Food",
    "zepto": "Food", "blinkit": "Food", "dunzo": "Food", "bigbasket": "Food",

    # Shopping & Electronics
    "amazon": "Shopping", "apple": "Shopping", "flipkart": "Shopping", "myntra": "Shopping",
    "walmart": "Shopping", "target": "Shopping", "best buy": "Shopping", "nike": "Shopping",
    "zara": "Shopping", "ikea": "Shopping",

    # Travel & Transportation
    "uber": "Travel", "lyft": "Travel", "ola": "Travel", "rapido": "Travel",
    "indigo": "Travel", "delta": "Travel", "united airlines": "Travel", "airbnb": "Travel",
    "makemytrip": "Travel", "shell": "Travel", "chevron": "Travel", "bp": "Travel",

    # Entertainment & Subscriptions
    "netflix": "Entertainment", "spotify": "Entertainment", "youtube": "Entertainment",
    "disney": "Entertainment", "hulu": "Entertainment", "hbo": "Entertainment",
    "playstation": "Entertainment", "steam": "Entertainment", "bookmyshow": "Entertainment",

    # Bills & Utilities
    "aws": "Bills", "google cloud": "Bills", "microsoft": "Bills", "pg&e": "Bills",
    "verizon": "Bills", "at&t": "Bills", "t-mobile": "Bills", "airtel": "Bills", "jio": "Bills",
    "equinox": "Bills", "golds gym": "Bills",

    # Medical & Health
    "apollo": "Medical", "cvs": "Medical", "walgreens": "Medical", "1mg": "Medical",
    "pharmeasy": "Medical"
}


class AICategorizer:
    @classmethod
    async def categorize(cls, merchant_name: str, notes: str = "") -> Tuple[str, float]:
        """
        Categorize transaction using rule matching or LLM inference.
        Returns: (category_name, confidence_score)
        """
        merchant_clean = merchant_name.lower().strip()

        # 1. Check direct substring matching in static rule map
        for pattern, cat in STATIC_CATEGORY_MAP.items():
            if pattern in merchant_clean:
                return cat, 1.0

        # 2. Try LLM if API Key is available
        if settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                prompt = (
                    f"Classify this financial merchant into one of: Food, Shopping, Travel, Entertainment, Bills, Medical, Income, Others.\n"
                    f"Merchant: {merchant_name}\nNotes: {notes}\nReturn ONLY the single category name."
                )
                response = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=10,
                    temperature=0.0
                )
                category = response.choices[0].message.content.strip().title()
                if category in ["Food", "Shopping", "Travel", "Entertainment", "Bills", "Medical", "Income", "Others"]:
                    return category, 0.95
            except Exception as e:
                logger.warning(f"OpenAI categorization fallback: {e}")

        # Default fallback
        return "Others", 0.70
