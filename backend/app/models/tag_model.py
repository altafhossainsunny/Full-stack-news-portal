from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class TagModel:
    COLLECTION = "tags"

    @staticmethod
    def collection():
        return mongo.db[TagModel.COLLECTION]

    @staticmethod
    def get_or_create(name: str) -> str:
        name = name.strip().lower()
        existing = TagModel.collection().find_one({"name": name})
        if existing:
            return str(existing["_id"])
        result = TagModel.collection().insert_one({
            "name": name,
            "slug": name.replace(" ", "-"),
            "article_count": 0,
            "created_at": datetime.now(timezone.utc),
        })
        return str(result.inserted_id)

    @staticmethod
    def list_all(limit=100):
        return list(TagModel.collection().find({}).sort("article_count", -1).limit(limit))

    @staticmethod
    def increment(name: str):
        TagModel.collection().update_one({"name": name}, {"$inc": {"article_count": 1}})

    @staticmethod
    def search(q: str):
        return list(TagModel.collection().find({"name": {"$regex": q, "$options": "i"}}).limit(20))
