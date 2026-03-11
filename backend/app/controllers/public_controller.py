from flask import request
from ..models.article_model import ArticleModel
from ..models.category_model import CategoryModel
from ..models.corner_model import CornerModel
from ..models.ad_model import AdModel
from ..models.live_stream_model import LiveStreamModel
from ..utils.response_helper import success, error
from ..utils.datetime_helper import serialize_doc, serialize_list


def public_categories():
    """Return all active categories ordered by `order` — no auth required."""
    cats = CategoryModel.list_all(active_only=True)
    return success(serialize_list(cats))


def homepage():
    hero = list(ArticleModel.collection().find({"status": "published", "is_featured": True}).sort("publish_date", -1).limit(5))
    if not hero:
        hero = ArticleModel.list_published(limit=1)
    top_stories = ArticleModel.list_published(limit=6)
    latest = ArticleModel.list_published(limit=10)
    breaking = list(ArticleModel.collection().find({"status": "published", "is_breaking": True}).limit(5))
    trending = list(ArticleModel.collection().find({"status": "published"}).sort("view_count", -1).limit(8))
    live_stream = LiveStreamModel.find_active()
    ads = AdModel.list_active()

    return success({
        "hero": serialize_list(hero),
        "top_stories": serialize_list(top_stories),
        "latest": serialize_list(latest),
        "breaking": serialize_list(breaking),
        "trending": serialize_list(trending),
        "live_stream": serialize_doc(live_stream),
        "ads": serialize_list(ads),
    })


def article_detail(slug):
    article = ArticleModel.find_by_slug(slug)
    if not article or article.get("status") != "published":
        return error("Article not found", 404)
    ArticleModel.increment_views(str(article["_id"]))
    related = ArticleModel.list_published(limit=4, category_id=str(article.get("category_id")))
    return success({
        "article": serialize_doc(article),
        "related": serialize_list(related),
    })


def category_articles(slug):
    cat = CategoryModel.find_by_slug(slug)
    if not cat:
        return error("Category not found", 404)
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))
    skip = (page - 1) * per_page
    articles = ArticleModel.list_published(skip=skip, limit=per_page, category_id=str(cat["_id"]))
    return success({
        "category": serialize_doc(cat),
        "articles": serialize_list(articles),
        "page": page,
        "per_page": per_page,
    })


def corner_articles(slug):
    corner = CornerModel.find_by_slug(slug)
    if not corner:
        return error("Corner not found", 404)
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))
    skip = (page - 1) * per_page
    articles = ArticleModel.list_published(skip=skip, limit=per_page, corner_id=str(corner["_id"]))
    return success({
        "corner": serialize_doc(corner),
        "articles": serialize_list(articles),
    })


def search_articles():
    q = request.args.get("q", "").strip()
    if not q:
        return error("Search query required", 400)
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))
    skip = (page - 1) * per_page
    articles = ArticleModel.search(q, skip=skip, limit=per_page)
    return success({"query": q, "results": serialize_list(articles)})


def trending_articles():
    limit = int(request.args.get("limit", 10))
    articles = list(
        ArticleModel.collection()
        .find({"status": "published"})
        .sort("view_count", -1)
        .limit(limit)
    )
    return success(serialize_list(articles))


def breaking_news():
    articles = list(
        ArticleModel.collection()
        .find({"status": "published", "is_breaking": True})
        .sort("publish_date", -1)
        .limit(10)
    )
    return success(serialize_list(articles))


def live_now():
    stream = LiveStreamModel.find_active()
    return success(serialize_doc(stream))


def active_ads():
    placement = request.args.get("placement")
    ads = AdModel.list_active(placement=placement)
    return success(serialize_list(ads))
