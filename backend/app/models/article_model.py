from datetime import datetime, timezone
from bson import ObjectId
from ..extensions import mongo


class ArticleModel:
    COLLECTION = "articles"

    STATUSES = [
        "draft", "submitted", "under_review", "rejected",
        "approved", "scheduled", "published", "unpublished", "archived",
    ]

    @staticmethod
    def collection():
        return mongo.db[ArticleModel.COLLECTION]

    @staticmethod
    def create(data: dict) -> str:
        article = {
            "title": data["title"],
            "subtitle": data.get("subtitle", ""),
            "summary": data.get("summary", ""),
            "slug": data["slug"],
            "content": data["content"],
            "featured_image": data.get("featured_image"),
            "gallery": data.get("gallery", []),
            "video_link": data.get("video_link"),
            "category_id": ObjectId(data["category_id"]) if data.get("category_id") else None,
            "corner_id": ObjectId(data["corner_id"]) if data.get("corner_id") else None,
            "tags": data.get("tags", []),
            "author_id": ObjectId(data["author_id"]),
            "reviewer_id": None,
            "status": "draft",
            "is_breaking": False,
            "is_featured": False,
            "is_sponsored": data.get("is_sponsored", False),
            "sponsored_label": data.get("sponsored_label", ""),
            "is_editors_pick": False,
            "is_trending": False,
            "seo_title": data.get("seo_title", ""),
            "seo_description": data.get("seo_description", ""),
            "view_count": 0,
            "publish_date": data.get("publish_date"),
            "rejection_reason": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = ArticleModel.collection().insert_one(article)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(article_id: str):
        return ArticleModel.collection().find_one({"_id": ObjectId(article_id)})

    @staticmethod
    def find_by_slug(slug: str):
        return ArticleModel.collection().find_one({"slug": slug})

    @staticmethod
    def update(article_id: str, data: dict):
        data["updated_at"] = datetime.now(timezone.utc)
        return ArticleModel.collection().update_one(
            {"_id": ObjectId(article_id)}, {"$set": data}
        )

    @staticmethod
    def increment_views(article_id: str):
        return ArticleModel.collection().update_one(
            {"_id": ObjectId(article_id)}, {"$inc": {"view_count": 1}}
        )

    @staticmethod
    def list_published(skip=0, limit=20, category_id=None, corner_id=None, tag=None):
        query = {"status": "published"}
        if category_id:
            query["category_id"] = ObjectId(category_id)
        if corner_id:
            query["corner_id"] = ObjectId(corner_id)
        if tag:
            query["tags"] = {"$in": [tag]}
        cursor = (
            ArticleModel.collection()
            .find(query)
            .sort("publish_date", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_by_status(status: str, skip=0, limit=20):
        cursor = (
            ArticleModel.collection()
            .find({"status": status})
            .sort("updated_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def list_by_author(author_id: str, skip=0, limit=20):
        cursor = (
            ArticleModel.collection()
            .find({"author_id": ObjectId(author_id)})
            .sort("updated_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def search(keyword: str, skip=0, limit=20):
        query = {
            "status": "published",
            "$or": [
                {"title": {"$regex": keyword, "$options": "i"}},
                {"summary": {"$regex": keyword, "$options": "i"}},
                {"tags": {"$in": [keyword]}},
            ],
        }
        return list(ArticleModel.collection().find(query).skip(skip).limit(limit))

    @staticmethod
    def list_all(skip=0, limit=20):
        cursor = (
            ArticleModel.collection()
            .find({})
            .sort("updated_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    @staticmethod
    def count(filters: dict = None):
        return ArticleModel.collection().count_documents(filters or {})
