from flask import Blueprint
from ..controllers.public_controller import (
    homepage, article_detail, category_articles, corner_articles,
    search_articles, trending_articles, breaking_news, live_now, active_ads,
    public_categories
)
from ..controllers.newsletter_controller import newsletter_subscribe, newsletter_unsubscribe

public_bp = Blueprint("public", __name__)

@public_bp.get("/")
def welcome():
    return {"message": "Bangladesh Global Newspaper API is running successfully!"}

public_bp.get("/homepage")(homepage)
public_bp.get("/articles/<slug>")(article_detail)
public_bp.get("/categories/<slug>/articles")(category_articles)
public_bp.get("/corners/<slug>/articles")(corner_articles)
public_bp.get("/search")(search_articles)
public_bp.get("/trending")(trending_articles)
public_bp.get("/breaking")(breaking_news)
public_bp.get("/live")(live_now)
public_bp.get("/ads")(active_ads)
public_bp.get("/categories")(public_categories)
public_bp.post("/newsletter/subscribe")(newsletter_subscribe)
public_bp.get("/newsletter/unsubscribe/<token>")(newsletter_unsubscribe)
