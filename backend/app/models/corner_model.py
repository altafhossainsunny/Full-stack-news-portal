from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class CornerModel:
    COLLECTION = "corners"

    @staticmethod
    def collection():
        return mongo.db[CornerModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        corner = {
            "name": data["name"],
            "slug": data["slug"],
            "description": data.get("description", ""),
            "banner_image": data.get("banner_image"),
            "is_active": True,
            "is_archived": False,
            "created_by": ObjectId(data["created_by"]) if data.get("created_by") else None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = CornerModel.collection().insert_one(corner)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(corner_id: str):
        return CornerModel.collection().find_one({"_id": ObjectId(corner_id)})

    @staticmethod
    def find_by_slug(slug: str):
        return CornerModel.collection().find_one({"slug": slug})

    @staticmethod
    def update(corner_id: str, data: dict):
        data["updated_at"] = datetime.now(timezone.utc)
        return CornerModel.collection().update_one({"_id": ObjectId(corner_id)}, {"$set": data})

    @staticmethod
    def list_all(active_only=False):
        query = {"is_active": True, "is_archived": False} if active_only else {}
        return list(CornerModel.collection().find(query).sort("created_at", -1))

    @staticmethod
    def delete(corner_id: str):
        return CornerModel.collection().delete_one({"_id": ObjectId(corner_id)})
