from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class LiveStreamModel:
    COLLECTION = "live_streams"

    @staticmethod
    def collection():
        return mongo.db[LiveStreamModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        stream = {
            "title": data["title"],
            "description": data.get("description", ""),
            "stream_url": data["stream_url"],   # YouTube / Facebook embed URL
            "platform": data.get("platform", "youtube"),  # youtube | facebook | other
            "is_live": True,
            "is_active": True,
            "created_by": ObjectId(data["created_by"]),
            "started_at": datetime.now(timezone.utc),
            "ended_at": None,
            "created_at": datetime.now(timezone.utc),
        }
        result = LiveStreamModel.collection().insert_one(stream)
        return str(result.inserted_id)

    @staticmethod
    def find_active():
        return LiveStreamModel.collection().find_one({"is_live": True, "is_active": True})

    @staticmethod
    def end_stream(stream_id: str):
        return LiveStreamModel.collection().update_one(
            {"_id": ObjectId(stream_id)},
            {"$set": {"is_live": False, "ended_at": datetime.now(timezone.utc)}},
        )

    @staticmethod
    def list_all(skip=0, limit=20):
        return list(LiveStreamModel.collection().find({}).sort("created_at", -1).skip(skip).limit(limit))


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
    def list_by_event(event_title: str, limit=50):
        cursor = (
            LiveUpdateModel.collection()
            .find({"event_title": event_title})
            .sort("timestamp", 1)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_recent(limit=20):
        return list(LiveUpdateModel.collection().find({}).sort("timestamp", -1).limit(limit))
