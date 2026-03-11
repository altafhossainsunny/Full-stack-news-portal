from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class ActivityLogModel:
    COLLECTION = "activity_logs"

    @staticmethod
    def collection():
        return mongo.db[ActivityLogModel.COLLECTION]

    @staticmethod
    def log(user_id: str, action: str, target_type: str, target_id: str = None, details: str = ""):
        entry = {
            "user_id": ObjectId(user_id),
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "details": details,
            "created_at": datetime.now(timezone.utc),
        }
        ActivityLogModel.collection().insert_one(entry)

    @staticmethod
    def list_recent(skip=0, limit=50):
        cursor = (
            ActivityLogModel.collection()
            .find({})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_by_user(user_id: str, skip=0, limit=30):
        cursor = (
            ActivityLogModel.collection()
            .find({"user_id": ObjectId(user_id)})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)
