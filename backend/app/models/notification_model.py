from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class NotificationModel:
    COLLECTION = "notifications"

    TYPES = ["article_approved", "article_rejected", "invitation_received", "submission_returned", "publication_done"]

    @staticmethod
    def collection():
        return mongo.db[NotificationModel.COLLECTION]

    @staticmethod
    def create(user_id: str, notif_type: str, message: str, link: str = None) -> str:
        notif = {
            "user_id": ObjectId(user_id),
            "type": notif_type,
            "message": message,
            "link": link,
            "is_read": False,
            "created_at": datetime.now(timezone.utc),
        }
        result = NotificationModel.collection().insert_one(notif)
        return str(result.inserted_id)

    @staticmethod
    def list_for_user(user_id: str, unread_only=False, skip=0, limit=20):
        query = {"user_id": ObjectId(user_id)}
        if unread_only:
            query["is_read"] = False
        cursor = (
            NotificationModel.collection()
            .find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def mark_read(notif_id: str):
        return NotificationModel.collection().update_one(
            {"_id": ObjectId(notif_id)}, {"$set": {"is_read": True}}
        )

    @staticmethod
    def mark_all_read(user_id: str):
        return NotificationModel.collection().update_many(
            {"user_id": ObjectId(user_id)}, {"$set": {"is_read": True}}
        )

    @staticmethod
    def unread_count(user_id: str) -> int:
        return NotificationModel.collection().count_documents(
            {"user_id": ObjectId(user_id), "is_read": False}
        )
