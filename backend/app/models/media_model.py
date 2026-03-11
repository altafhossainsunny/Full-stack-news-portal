from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class MediaModel:
    COLLECTION = "media"

    @staticmethod
    def collection():
        return mongo.db[MediaModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        media = {
            "filename": data["filename"],
            "original_name": data["original_name"],
            "file_type": data["file_type"],   # image | video | audio | document
            "mime_type": data["mime_type"],
            "file_size": data["file_size"],
            "url": data["url"],
            "folder": data.get("folder", "articles"),
            "alt_text": data.get("alt_text", ""),
            "uploaded_by": ObjectId(data["uploaded_by"]),
            "created_at": datetime.now(timezone.utc),
        }
        result = MediaModel.collection().insert_one(media)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(media_id: str):
        return MediaModel.collection().find_one({"_id": ObjectId(media_id)})

    @staticmethod
    def list_by_folder(folder: str, skip=0, limit=30):
        cursor = (
            MediaModel.collection()
            .find({"folder": folder})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_all(skip=0, limit=30):
        return list(MediaModel.collection().find({}).sort("created_at", -1).skip(skip).limit(limit))

    @staticmethod
    def delete(media_id: str):
        return MediaModel.collection().delete_one({"_id": ObjectId(media_id)})
