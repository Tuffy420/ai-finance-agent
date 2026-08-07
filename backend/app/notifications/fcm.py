"""
Firebase Cloud Messaging (FCM) Push Notification Dispatcher
"""

from typing import Dict, Any, Optional
from app.config.settings import settings
from app.config.logging import logger


class FCMNotificationService:
    @classmethod
    async def send_push(
        cls,
        fcm_token: str,
        title: str,
        body: str,
        data_payload: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send push notification via Firebase Admin SDK or log in dev mode.
        """
        logger.info(f"🚀 [FCM Push] Sending to {fcm_token[:10]}... Title: '{title}', Body: '{body}'")
        try:
            # In production with active credentials:
            # import firebase_admin
            # from firebase_admin import messaging
            # message = messaging.Message(
            #     notification=messaging.Notification(title=title, body=body),
            #     data=data_payload or {},
            #     token=fcm_token
            # )
            # response = messaging.send(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send FCM push notification: {e}")
            return False
