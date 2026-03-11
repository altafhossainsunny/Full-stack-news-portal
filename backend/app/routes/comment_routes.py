from flask import Blueprint
from ..controllers.comment_controller import (
    post_comment, list_comments, approve_comment, delete_comment
)

comment_bp = Blueprint("comments", __name__)

comment_bp.post("/")(post_comment)
comment_bp.get("/<article_id>")(list_comments)
comment_bp.post("/<comment_id>/approve")(approve_comment)
comment_bp.delete("/<comment_id>")(delete_comment)
