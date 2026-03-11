from flask import request
from ..models.comment_model import CommentModel
from ..utils.response_helper import success, error
from ..utils.datetime_helper import serialize_list
from ..middleware.auth_middleware import roles_required


def post_comment():
    data = request.get_json()
    required = ["article_id", "author_name", "content"]
    if not all(data.get(f) for f in required):
        return error("article_id, author_name, and content are required", 400)
    comment_id = CommentModel.create(data)
    return success({"comment_id": comment_id}, "Comment submitted for review", 201)


def list_comments(article_id):
    comments = CommentModel.list_for_article(article_id, approved_only=True)
    return success(serialize_list(comments))


@roles_required("owner", "publisher", "editor")
def approve_comment(comment_id):
    CommentModel.approve(comment_id)
    return success(message="Comment approved")


@roles_required("owner", "publisher")
def delete_comment(comment_id):
    CommentModel.delete(comment_id)
    return success(message="Comment deleted")
