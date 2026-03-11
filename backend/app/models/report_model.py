from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class ReportModel:
    COLLECTION = "reports"

    STATUSES = ["submitted", "under_review", "translated", "approved", "rejected", "published"]

    @staticmethod
    def collection():
        return mongo.db[ReportModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        report = {
            "title": data.get("title", ""),
            "content_original": data["content_original"],
            "language_original": data.get("language_original", "unknown"),
            "content_translated": data.get("content_translated"),
            "language_translated": "en",
            "audio_file": data.get("audio_file"),
            "media_files": data.get("media_files", []),
            "reporter_id": ObjectId(data["reporter_id"]),
            "assigned_editor_id": None,
            "status": "submitted",
            "feedback": None,
            "article_id": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = ReportModel.collection().insert_one(report)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(report_id: str):
        return ReportModel.collection().find_one({"_id": ObjectId(report_id)})

    @staticmethod
    def update(report_id: str, data: dict):
        data["updated_at"] = datetime.now(timezone.utc)
        return ReportModel.collection().update_one(
            {"_id": ObjectId(report_id)}, {"$set": data}
        )

    @staticmethod
    def list_by_reporter(reporter_id: str, skip=0, limit=20):
        cursor = (
            ReportModel.collection()
            .find({"reporter_id": ObjectId(reporter_id)})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_all(skip=0, limit=20):
        cursor = ReportModel.collection().find({}).sort("created_at", -1).skip(skip).limit(limit)
        return list(cursor)

    @staticmethod
    def count(filters: dict = None) -> int:
        return ReportModel.collection().count_documents(filters or {})
