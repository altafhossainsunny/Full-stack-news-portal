from flask import request
from flask_jwt_extended import get_jwt_identity
from ..models.article_model import ArticleModel
from ..models.activity_log_model import ActivityLogModel
from ..models.notification_model import NotificationModel
from ..utils.response_helper import success, error, paginated
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..utils.slug_helper import unique_slug
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("owner", "publisher", "editor")
def create_article():
    data = request.get_json()
    if not data.get("title") or not data.get("content"):
        return error("Title and content are required", 400)

    if not data.get("category_id"):
        return error("Category is required", 400)

    user_id = get_jwt_identity()
    data["author_id"] = user_id
    data["slug"] = unique_slug(data["title"], lambda s: ArticleModel.find_by_slug(s) is not None)

    article_id = ArticleModel.create(data)
    ActivityLogModel.log(user_id, "create_article", "article", article_id)
    return success({"article_id": article_id}, "Article created", 201)


@jwt_required_custom
def list_articles():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page
    status = request.args.get("status")
    author_id = request.args.get("author_id")

    if author_id:
        from bson import ObjectId
        articles = ArticleModel.list_by_author(author_id, skip=skip, limit=per_page)
        total = ArticleModel.count({"author_id": ObjectId(author_id)})
    elif status == "all":
        articles = ArticleModel.list_all(skip=skip, limit=per_page)
        total = ArticleModel.count()
    elif status:
        articles = ArticleModel.list_by_status(status, skip=skip, limit=per_page)
        total = ArticleModel.count({"status": status})
    else:
        articles = ArticleModel.list_published(skip=skip, limit=per_page)
        total = ArticleModel.count({"status": "published"})

    return paginated(serialize_list(articles), total, page, per_page)


@roles_required("owner", "publisher", "editor")
def my_articles():
    from bson import ObjectId as _OId
    user_id = get_jwt_identity()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page
    status = request.args.get("status")
    query = {"author_id": _OId(user_id)}
    if status:
        query["status"] = status
    articles = list(
        ArticleModel.collection()
        .find(query)
        .sort("updated_at", -1)
        .skip(skip)
        .limit(per_page)
    )
    total = ArticleModel.count(query)
    return paginated(serialize_list(articles), total, page, per_page)


@jwt_required_custom
def get_article(article_id):
    article = ArticleModel.find_by_id(article_id)
    if not article:
        return error("Article not found", 404)
    return success(serialize_doc(article))


@roles_required("owner", "publisher", "editor")
def update_article(article_id):
    user_id = get_jwt_identity()
    article = ArticleModel.find_by_id(article_id)
    if not article:
        return error("Article not found", 404)

    data = request.get_json()
    allowed = [
        "title", "subtitle", "summary", "content", "featured_image",
        "gallery", "video_link", "category_id", "corner_id", "tags",
        "seo_title", "seo_description", "is_sponsored", "sponsored_label",
    ]
    update_data = {k: v for k, v in data.items() if k in allowed}

    if "title" in update_data and update_data["title"] != article["title"]:
        update_data["slug"] = unique_slug(
            update_data["title"], lambda s: ArticleModel.find_by_slug(s) is not None
        )

    ArticleModel.update(article_id, update_data)
    ActivityLogModel.log(user_id, "update_article", "article", article_id)
    return success(message="Article updated")


@roles_required("owner", "publisher", "editor")
def delete_article(article_id):
    user_id = get_jwt_identity()
    ArticleModel.update(article_id, {"status": "archived"})
    ActivityLogModel.log(user_id, "archive_article", "article", article_id)
    return success(message="Article archived")


@roles_required("editor", "owner", "publisher")
def submit_article(article_id):
    user_id = get_jwt_identity()
    article = ArticleModel.find_by_id(article_id)
    if not article:
        return error("Article not found", 404)
    if article["status"] not in ("draft", "rejected"):
        return error("Only drafts or rejected articles can be submitted", 400)

    ArticleModel.update(article_id, {"status": "submitted"})
    ActivityLogModel.log(user_id, "submit_article", "article", article_id)
    return success(message="Article submitted for review")


@roles_required("owner", "publisher")
def review_article(article_id):
    data = request.get_json()
    action = data.get("action")   # "approve" | "reject" | "return"
    reason = data.get("reason", "")
    user_id = get_jwt_identity()

    if action == "approve":
        ArticleModel.update(article_id, {"status": "approved", "reviewer_id": user_id})
        ActivityLogModel.log(user_id, "approve_article", "article", article_id)
        article = ArticleModel.find_by_id(article_id)
        if article:
            NotificationModel.create(
                str(article["author_id"]), "article_approved",
                f"Your article has been approved.", f"/editor/articles/{article_id}"
            )
    elif action == "reject":
        ArticleModel.update(article_id, {"status": "rejected", "rejection_reason": reason})
        ActivityLogModel.log(user_id, "reject_article", "article", article_id)
        article = ArticleModel.find_by_id(article_id)
        if article:
            NotificationModel.create(
                str(article["author_id"]), "article_rejected",
                f"Your article was rejected: {reason}", f"/editor/articles/{article_id}"
            )
    elif action == "return":
        ArticleModel.update(article_id, {"status": "draft", "rejection_reason": reason})
        ActivityLogModel.log(user_id, "return_article", "article", article_id)
    else:
        return error("Invalid action. Use 'approve', 'reject', or 'return'", 400)

    return success(message=f"Article {action}d")


@roles_required("owner", "publisher")
def publish_article(article_id):
    user_id = get_jwt_identity()
    article = ArticleModel.find_by_id(article_id)
    if not article:
        return error("Article not found", 404)
    if article["status"] not in ("approved", "scheduled", "unpublished", "archived"):
        return error("Article must be approved before publishing", 400)

    from datetime import datetime, timezone
    ArticleModel.update(article_id, {"status": "published", "publish_date": datetime.now(timezone.utc)})
    ActivityLogModel.log(user_id, "publish_article", "article", article_id)
    return success(message="Article published")


@roles_required("owner", "publisher")
def unpublish_article(article_id):
    user_id = get_jwt_identity()
    ArticleModel.update(article_id, {"status": "unpublished"})
    ActivityLogModel.log(user_id, "unpublish_article", "article", article_id)
    return success(message="Article unpublished")


@roles_required("owner", "publisher")
def set_breaking(article_id):
    data = request.get_json()
    val = data.get("value", True)
    ArticleModel.update(article_id, {"is_breaking": val})
    return success(message=f"Breaking news {'set' if val else 'removed'}")


@roles_required("owner", "publisher")
def set_featured(article_id):
    data = request.get_json()
    val = data.get("value", True)
    ArticleModel.update(article_id, {"is_featured": val})
    return success(message=f"Featured {'set' if val else 'removed'}")


@roles_required("owner", "publisher")
def set_editors_pick(article_id):
    data = request.get_json()
    val = data.get("value", True)
    ArticleModel.update(article_id, {"is_editors_pick": val})
    return success(message=f"Editor's pick {'set' if val else 'removed'}")


@roles_required("owner", "publisher")
def schedule_article(article_id):
    """Set a future publish_date and move article to 'scheduled' status."""
    data = request.get_json()
    scheduled_at = data.get("scheduled_at")
    if not scheduled_at:
        return error("scheduled_at is required", 400)

    from datetime import datetime, timezone
    try:
        if scheduled_at.endswith("Z"):
            scheduled_at = scheduled_at[:-1] + "+00:00"
        publish_date = datetime.fromisoformat(scheduled_at)
        if publish_date.tzinfo is None:
            publish_date = publish_date.replace(tzinfo=timezone.utc)
    except (ValueError, AttributeError):
        return error("Invalid datetime format. Use ISO 8601.", 400)

    if publish_date <= datetime.now(timezone.utc):
        return error("Scheduled time must be in the future", 400)

    article = ArticleModel.find_by_id(article_id)
    if not article:
        return error("Article not found", 404)

    allowed_statuses = ("draft", "submitted", "approved", "rejected", "unpublished")
    if article["status"] not in allowed_statuses:
        return error(f"Cannot schedule article with status '{article['status']}'", 400)

    user_id = get_jwt_identity()
    ArticleModel.update(article_id, {
        "status": "scheduled",
        "publish_date": publish_date,
        "reviewer_id": user_id,
    })
    ActivityLogModel.log(user_id, "schedule_article", "article", article_id)
    return success(message="Article scheduled")


@roles_required("owner", "publisher")
def process_scheduled():
    """Publish all scheduled articles whose publish_date is now or in the past."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    due = list(ArticleModel.collection().find({
        "status": "scheduled",
        "publish_date": {"$lte": now},
    }))
    for art in due:
        ArticleModel.update(str(art["_id"]), {"status": "published"})
    return success({"published": len(due)}, f"Published {len(due)} scheduled articles")
