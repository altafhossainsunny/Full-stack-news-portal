from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class AdModel:
    COLLECTION = "ads"

    PLACEMENTS = ["header_banner", "mid_section_banner", "sidebar_banner", "article_page_banner", "footer_banner"]

    @staticmethod
    def collection():
        return mongo.db[AdModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        ad = {
            "title": data["title"],
            "image_url": data["image_url"],
            "target_url": data["target_url"],
            "placement": data["placement"],
            "is_active": data.get("is_active", True),
            "start_date": data.get("start_date"),
            "end_date": data.get("end_date"),
            "click_count": 0,
            "impression_count": 0,
            "created_by": ObjectId(data["created_by"]),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = AdModel.collection().insert_one(ad)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(ad_id: str):
        return AdModel.collection().find_one({"_id": ObjectId(ad_id)})

    @staticmethod
    def update(ad_id: str, data: dict):
        data["updated_at"] = datetime.now(timezone.utc)
        return AdModel.collection().update_one({"_id": ObjectId(ad_id)}, {"$set": data})

    @staticmethod
    def list_active(placement: str = None):
        now = datetime.now(timezone.utc)
        query = {
            "is_active": True,
            "$or": [
                {"end_date": None},
                {"end_date": {"$gte": now}},
            ],
        }
        if placement:
            query["placement"] = placement
        return list(AdModel.collection().find(query))

    @staticmethod
    def list_all(skip=0, limit=20):
        return list(AdModel.collection().find({}).sort("created_at", -1).skip(skip).limit(limit))

    @staticmethod
    def delete(ad_id: str):
        return AdModel.collection().delete_one({"_id": ObjectId(ad_id)})

    @staticmethod
    def count(filters: dict = None) -> int:
        return AdModel.collection().count_documents(filters or {})

    @staticmethod
    def track_click(ad_id: str):
        AdModel.collection().update_one({"_id": ObjectId(ad_id)}, {"$inc": {"click_count": 1}})

    @staticmethod
    def track_impression(ad_id: str):
        AdModel.collection().update_one({"_id": ObjectId(ad_id)}, {"$inc": {"impression_count": 1}})
