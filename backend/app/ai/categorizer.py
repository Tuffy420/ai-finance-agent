"""
AI Transaction Categorization Engine
Supports Google Gemini (Primary) and OpenAI LLM classification with fast heuristic rule caching.
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
    "kfc": "Food", "pizza hut": "Food", "burger king": "Food", "chai point": "Food",

    # Shopping & Electronics
    "amazon": "Shopping", "apple": "Shopping", "flipkart": "Shopping", "myntra": "Shopping",
    "walmart": "Shopping", "target": "Shopping", "best buy": "Shopping", "nike": "Shopping",
    "zara": "Shopping", "ikea": "Shopping", "croma": "Shopping", "reliance digital": "Shopping",

    # Travel & Transportation
    "uber": "Travel", "lyft": "Travel", "ola": "Travel", "rapido": "Travel",
    "indigo": "Travel", "delta": "Travel", "united airlines": "Travel", "airbnb": "Travel",
    "makemytrip": "Travel", "shell": "Travel", "chevron": "Travel", "bp": "Travel", "irctc": "Travel",

    # Entertainment & Subscriptions
    "netflix": "Entertainment", "spotify": "Entertainment", "youtube": "Entertainment",
    "disney": "Entertainment", "hulu": "Entertainment", "hbo": "Entertainment",
    "playstation": "Entertainment", "steam": "Entertainment", "bookmyshow": "Entertainment",
    "hotstar": "Entertainment", "prime video": "Entertainment",

    # Bills & Utilities
    "aws": "Bills", "google cloud": "Bills", "microsoft": "Bills", "pg&e": "Bills",
    "verizon": "Bills", "at&t": "Bills", "t-mobile": "Bills", "airtel": "Bills", "jio": "Bills",
    "equinox": "Bills", "golds gym": "Bills", "bescom": "Bills", "tatapower": "Bills",

    # Medical & Health
    "apollo": "Medical", "cvs": "Medical", "walgreens": "Medical", "1mg": "Medical",
    "pharmeasy": "Medical", "netmeds": "Medical", "medplus": "Medical"
}

VALID_CATEGORIES = ["Food", "Shopping", "Travel", "Entertainment", "Bills", "Medical", "Income", "Others"]


class AICategorizer:
    @classmethod
    async def categorize(cls, merchant_name: str, notes: str = "") -> Tuple[str, float]:
        """
        Categorize transaction using Gemini LLM, OpenAI, or local rule matching.
        Returns: (category_name, confidence_score)
        """
        merchant_clean = merchant_name.lower().strip()

        # 1. Check direct substring matching in static rule map (zero latency)
        for pattern, cat in STATIC_CATEGORY_MAP.items():
            if pattern in merchant_clean:
                return cat, 1.0

        # 2. Try Google Gemini API if GEMINI_API_KEY is provided
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel(settings.GEMINI_MODEL)
                
                prompt = (
                    f"Classify this financial merchant into exactly one of: Food, Shopping, Travel, Entertainment, Bills, Medical, Income, Others.\n"
                    f"Merchant Name: {merchant_name}\n"
                    f"Notes: {notes}\n"
                    f"Reply with ONLY the single category name and nothing else."
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    cat = response.text.strip().title()
                    if cat in VALID_CATEGORIES:
                        logger.info(f"✨ Gemini classified '{merchant_name}' -> {cat}")
                        return cat, 0.98
            except Exception as e:
                logger.warning(f"Google Gemini categorization fallback: {e}")

        # 3. Try OpenAI API if OPENAI_API_KEY is provided
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
                if category in VALID_CATEGORIES:
                    return category, 0.95
            except Exception as e:
                logger.warning(f"OpenAI categorization fallback: {e}")

        # Default fallback
        return "Others", 0.70
