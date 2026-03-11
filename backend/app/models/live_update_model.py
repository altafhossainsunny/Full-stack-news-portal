from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class LiveUpdateModel:
    COLLECTION = "live_updates"

    @staticmethod
    def collection():
        return mongo.db[LiveUpdateModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        update = {
            "stream_id": ObjectId(data["stream_id"]) if data.get("stream_id") else None,
            "event_title": data.get("event_title", ""),
            "content": data["content"],
            "posted_by": ObjectId(data["posted_by"]),
            "timestamp": datetime.now(timezone.utc),
        }
        result = LiveUpdateModel.collection().insert_one(update)
        return str(result.inserted_id)

    @staticmethod
    def list_by_stream(stream_id: str, limit=50):
        cursor = (
            LiveUpdateModel.collection()
            .find({"stream_id": ObjectId(stream_id)})
            .sort("timestamp", 1)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_recent(limit=20):
        return list(LiveUpdateModel.collection().find({}).sort("timestamp", -1).limit(limit))
