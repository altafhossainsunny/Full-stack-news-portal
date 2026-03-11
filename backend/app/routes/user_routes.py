from flask import Blueprint
from ..controllers.user_controller import (
    list_users, get_user, update_user, suspend_user, activate_user, delete_user
)

user_bp = Blueprint("users", __name__)

user_bp.get("/")(list_users)
user_bp.get("/<user_id>")(get_user)
user_bp.put("/<user_id>")(update_user)
user_bp.post("/<user_id>/suspend")(suspend_user)
user_bp.post("/<user_id>/activate")(activate_user)
user_bp.delete("/<user_id>")(delete_user)
