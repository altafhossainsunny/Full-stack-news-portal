from flask import request
from ..models.tag_model import TagModel
from ..utils.response_helper import success
from ..utils.datetime_helper import serialize_list
from ..middleware.auth_middleware import jwt_required_custom


@jwt_required_custom
def list_tags():
    limit = int(request.args.get("limit", 100))
    tags = TagModel.list_all(limit=limit)
    return success(serialize_list(tags))


@jwt_required_custom
def search_tags():
    q = request.args.get("q", "")
    tags = TagModel.search(q)
    return success(serialize_list(tags))
