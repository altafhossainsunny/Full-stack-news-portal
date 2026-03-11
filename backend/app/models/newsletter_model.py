from datetime import datetime, timezone
import secrets
from ..extensions import mongo


class NewsletterModel:
    COLLECTION = "newsletter_subscribers"

    @staticmethod
    def collection():
        return mongo.db[NewsletterModel.COLLECTION]

    @staticmethod
    def subscribe(email: str) -> dict:
        email = email.lower().strip()
        existing = NewsletterModel.find_by_email(email)
        if existing:
            if existing.get("is_active"):
                return None, "already_subscribed"
            # Re-activate if previously unsubscribed
            NewsletterModel.collection().update_one(
                {"email": email},
                {"$set": {"is_active": True, "subscribed_at": datetime.now(timezone.utc)}}
            )
            return existing, "reactivated"

        doc = {
            "email": email,
            "is_active": True,
            "subscribed_at": datetime.now(timezone.utc),
            "unsubscribe_token": secrets.token_urlsafe(32),
        }
        NewsletterModel.collection().insert_one(doc)
        return doc, "created"

    @staticmethod
    def find_by_email(email: str):
        return NewsletterModel.collection().find_one({"email": email.lower().strip()})

    @staticmethod
    def find_by_token(token: str):
        return NewsletterModel.collection().find_one({"unsubscribe_token": token})

    @staticmethod
    def unsubscribe(token: str) -> bool:
        result = NewsletterModel.collection().update_one(
            {"unsubscribe_token": token},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0

    @staticmethod
    def list_active(skip=0, limit=50):
        cursor = (
            NewsletterModel.collection()
            .find({"is_active": True})
            .sort("subscribed_at", -1)
            .skip(skip)
            .limit(limit)
        )
        docs = []
        for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            if doc.get("subscribed_at"):
                doc["subscribed_at"] = doc["subscribed_at"].isoformat()
            docs.append(doc)
        return docs

    @staticmethod
    def count_active() -> int:
        return NewsletterModel.collection().count_documents({"is_active": True})
