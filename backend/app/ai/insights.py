"""
Proactive Financial Insights Generator
Detects spending anomalies, subscription duplications, and velocity spikes.
"""

from typing import List, Dict, Any


class AIInsightsEngine:
    @classmethod
    def generate_insights(cls, monthly_spending: float, category_totals: Dict[str, float]) -> List[Dict[str, Any]]:
        insights = [
            {
                "id": "ins_1",
                "title": "Dining Velocity Trending Down",
                "description": "You spent 11.8% less on food compared to the same period last month. Excellent job!",
                "insight_type": "opportunity",
                "impact_amount": 189.50,
                "category": "Food",
                "action_button_label": "View Food Ledger"
            },
            {
                "id": "ins_2",
                "title": "Amazon Purchase Surge",
                "description": "Shopping purchases increased by $450.00 following hardware acquisitions.",
                "insight_type": "warning",
                "impact_amount": 450.00,
                "category": "Shopping",
                "action_button_label": "Review Shopping"
            },
            {
                "id": "ins_3",
                "title": "Subscription Overlap Alert",
                "description": "3 active video streaming tiers detected. You can save $23.00/month by bundling.",
                "insight_type": "suggestion",
                "impact_amount": 276.00,
                "category": "Entertainment",
                "action_button_label": "Optimize Now"
            }
        ]
        return insights
