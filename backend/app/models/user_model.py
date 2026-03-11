from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


def serialize(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


class UserModel:
    COLLECTION = "users"

    ROLES = ["owner", "publisher", "editor", "reporter"]

    @staticmethod
    def collection():
        return mongo.db[UserModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        user = {
            "name": data["name"],
            "email": data["email"].lower().strip(),
            "password_hash": data["password_hash"],
            "role": data["role"],
            "is_active": True,
            "avatar": data.get("avatar"),
            "bio": data.get("bio", ""),
            "nationality": data.get("nationality", ""),
            "languages": data.get("languages", []),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "last_login": None,
        }
        result = UserModel.collection().insert_one(user)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email: str):
        return UserModel.collection().find_one({"email": email.lower().strip()})

    @staticmethod
    def find_by_id(user_id: str):
        return UserModel.collection().find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def update(user_id: str, data: dict):
        data["updated_at"] = datetime.now(timezone.utc)
        return UserModel.collection().update_one(
            {"_id": ObjectId(user_id)}, {"$set": data}
        )

    @staticmethod
    def list_all(filters: dict = None, skip=0, limit=20):
        query = filters or {}
        cursor = UserModel.collection().find(query).skip(skip).limit(limit)
        return [serialize(u) for u in cursor]

    @staticmethod
    def count(filters: dict = None):
        return UserModel.collection().count_documents(filters or {})
