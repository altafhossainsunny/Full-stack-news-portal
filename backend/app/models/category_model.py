from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class CategoryModel:
    COLLECTION = "categories"

    @staticmethod
    def collection():
        return mongo.db[CategoryModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        category = {
            "name": data["name"],
            "slug": data["slug"],
            "description": data.get("description", ""),
            "is_active": True,
            "order": data.get("order", 0),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = CategoryModel.collection().insert_one(category)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(cat_id: str):
        return CategoryModel.collection().find_one({"_id": ObjectId(cat_id)})

    @staticmethod
    def find_by_slug(slug: str):
        return CategoryModel.collection().find_one({"slug": slug})

    @staticmethod
    def update(cat_id: str, data: dict):
        data["updated_at"] = datetime.now(timezone.utc)
        return CategoryModel.collection().update_one({"_id": ObjectId(cat_id)}, {"$set": data})

    @staticmethod
    def list_all(active_only=False):
        query = {"is_active": True} if active_only else {}
        return list(CategoryModel.collection().find(query).sort("order", 1))

    @staticmethod
    def delete(cat_id: str):
        return CategoryModel.collection().delete_one({"_id": ObjectId(cat_id)})

    @staticmethod
    def count(filters: dict = None) -> int:
        return CategoryModel.collection().count_documents(filters or {})
