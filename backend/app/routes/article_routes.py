from flask import Blueprint
from ..controllers.article_controller import (
    create_article, get_article, update_article, delete_article,
    list_articles, my_articles, submit_article, review_article, publish_article,
    unpublish_article, set_breaking, set_featured, set_editors_pick,
    schedule_article, process_scheduled,
)

article_bp = Blueprint("articles", __name__)

article_bp.post("/")(create_article)
article_bp.get("/")(list_articles)
article_bp.get("/my")(my_articles)
article_bp.get("/process-scheduled")(process_scheduled)
article_bp.get("/<article_id>")(get_article)
article_bp.put("/<article_id>")(update_article)
article_bp.delete("/<article_id>")(delete_article)
article_bp.post("/<article_id>/submit")(submit_article)
article_bp.post("/<article_id>/review")(review_article)
article_bp.post("/<article_id>/publish")(publish_article)
article_bp.post("/<article_id>/unpublish")(unpublish_article)
article_bp.post("/<article_id>/schedule")(schedule_article)
article_bp.post("/<article_id>/breaking")(set_breaking)
article_bp.post("/<article_id>/featured")(set_featured)
article_bp.post("/<article_id>/editors-pick")(set_editors_pick)
