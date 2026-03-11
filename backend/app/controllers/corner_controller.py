from flask import request
from flask_jwt_extended import get_jwt_identity
from ..models.corner_model import CornerModel
from ..utils.response_helper import success, error
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..utils.slug_helper import unique_slug
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("owner", "publisher")
def create_corner():
    data = request.get_json()
    if not data.get("name"):
        return error("Name is required", 400)
    data["slug"] = unique_slug(data["name"], lambda s: CornerModel.find_by_slug(s) is not None)
    data["created_by"] = get_jwt_identity()
    corner_id = CornerModel.create(data)
    return success({"corner_id": corner_id}, "Corner created", 201)


@jwt_required_custom
def list_corners():
    active_only = request.args.get("active_only", "false").lower() == "true"
    corners = CornerModel.list_all(active_only=active_only)
    return success(serialize_list(corners))


@jwt_required_custom
def get_corner(corner_id):
    corner = CornerModel.find_by_id(corner_id)
    if not corner:
        return error("Corner not found", 404)
    return success(serialize_doc(corner))


@roles_required("owner", "publisher")
def update_corner(corner_id):
    data = request.get_json()
    CornerModel.update(corner_id, data)
    return success(message="Corner updated")


@roles_required("owner")
def delete_corner(corner_id):
    CornerModel.delete(corner_id)
    return success(message="Corner deleted")
