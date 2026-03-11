from flask import request
from ..models.user_model import UserModel
from ..utils.response_helper import success, error, paginated
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..middleware.auth_middleware import roles_required


@roles_required("owner", "publisher")
def list_users():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    role = request.args.get("role")
    skip = (page - 1) * per_page

    filters = {}
    if role:
        filters["role"] = role

    users = UserModel.list_all(filters=filters, skip=skip, limit=per_page)
    total = UserModel.count(filters)
    return paginated(serialize_list(users), total, page, per_page)


@roles_required("owner", "publisher")
def get_user(user_id):
    user = UserModel.find_by_id(user_id)
    if not user:
        return error("User not found", 404)
    return success(serialize_doc(user))


@roles_required("owner")
def update_user(user_id):
    data = request.get_json()
    safe_fields = ["name", "bio", "nationality", "languages", "avatar"]
    update_data = {k: v for k, v in data.items() if k in safe_fields}
    UserModel.update(user_id, update_data)
    return success(message="User updated")


@roles_required("owner")
def suspend_user(user_id):
    UserModel.update(user_id, {"is_active": False})
    return success(message="User suspended")


@roles_required("owner")
def activate_user(user_id):
    UserModel.update(user_id, {"is_active": True})
    return success(message="User activated")


@roles_required("owner")
def delete_user(user_id):
    UserModel.collection().delete_one({"_id": __import__("bson").ObjectId(user_id)})
    return success(message="User deleted")
