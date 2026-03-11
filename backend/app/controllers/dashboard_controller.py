from flask import request
from ..models.article_model import ArticleModel
from ..models.user_model import UserModel
from ..models.activity_log_model import ActivityLogModel
from ..utils.response_helper import success
from ..utils.datetime_helper import serialize_list
from ..middleware.auth_middleware import roles_required, jwt_required_custom
from flask_jwt_extended import get_jwt_identity


@roles_required("owner")
def owner_stats():
    from ..models.ad_model import AdModel
    from ..models.category_model import CategoryModel
    from ..models.report_model import ReportModel
    stats = {
        "total_users": UserModel.count(),
        "published_articles": ArticleModel.count({"status": "published"}),
        "pending_articles": ArticleModel.count({"status": "submitted"}),
        "active_ads": AdModel.count({"is_active": True}),
        "categories": CategoryModel.count(),
        "reporter_submissions": ReportModel.count(),
        "editors": UserModel.count({"role": "editor"}),
        "reporters": UserModel.count({"role": "reporter"}),
    }
    return success(stats)


@roles_required("owner", "publisher")
def publisher_stats():
    from ..models.live_stream_model import LiveStreamModel
    from datetime import datetime, timezone
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    stats = {
        "pending_review": ArticleModel.count({"status": "submitted"}),
        "published_today": ArticleModel.count({"status": "published"}),
        "breaking_news": ArticleModel.count({"is_breaking": True}),
        "total_published": ArticleModel.count({"status": "published"}),
        "active_streams": LiveStreamModel.collection().count_documents({"is_active": True}),
    }
    return success(stats)


@roles_required("owner", "publisher", "editor")
def editor_stats():
    user_id = get_jwt_identity()
    from bson import ObjectId
    oid = ObjectId(user_id)
    stats = {
        "drafts": ArticleModel.count({"author_id": oid, "status": "draft"}),
        "submitted": ArticleModel.count({"author_id": oid, "status": "submitted"}),
        "approved": ArticleModel.count({"author_id": oid, "status": "approved"}),
        "rejected": ArticleModel.count({"author_id": oid, "status": "rejected"}),
        "published": ArticleModel.count({"author_id": oid, "status": "published"}),
    }
    return success(stats)


@roles_required("owner", "publisher", "editor", "reporter")
def reporter_stats():
    from ..models.report_model import ReportModel
    user_id = get_jwt_identity()
    from bson import ObjectId
    oid = ObjectId(user_id)
    col = ReportModel.collection()
    stats = {
        "total_reports": col.count_documents({"reporter_id": oid}),
        "pending": col.count_documents({"reporter_id": oid, "status": "submitted"}),
        "reviewed": col.count_documents({"reporter_id": oid, "status": "under_review"}),
        "published": col.count_documents({"reporter_id": oid, "status": "approved"}),
        "rejected": col.count_documents({"reporter_id": oid, "status": "rejected"}),
    }
    return success(stats)


@roles_required("owner", "publisher")
def activity_logs():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    skip = (page - 1) * per_page
    logs = ActivityLogModel.list_recent(skip=skip, limit=per_page)
    return success(serialize_list(logs))
