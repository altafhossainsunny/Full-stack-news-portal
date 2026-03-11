from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class CommentModel:
    COLLECTION = "comments"

    @staticmethod
    def collection():
        return mongo.db[CommentModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        comment = {
            "article_id": ObjectId(data["article_id"]),
            "author_name": data["author_name"],
            "author_email": data.get("author_email", ""),
            "content": data["content"],
            "is_approved": False,
            "created_at": datetime.now(timezone.utc),
        }
        result = CommentModel.collection().insert_one(comment)
        return str(result.inserted_id)

    @staticmethod
    def list_for_article(article_id: str, approved_only=True):
        query = {"article_id": ObjectId(article_id)}
        if approved_only:
            query["is_approved"] = True
        return list(
            CommentModel.collection().find(query).sort("created_at", 1)
        )

    @staticmethod
    def approve(comment_id: str):
        return CommentModel.collection().update_one(
            {"_id": ObjectId(comment_id)}, {"$set": {"is_approved": True}}
        )

    @staticmethod
    def delete(comment_id: str):
        return CommentModel.collection().delete_one({"_id": ObjectId(comment_id)})
