from flask import request
from flask_jwt_extended import get_jwt_identity
from ..models.notification_model import NotificationModel
from ..utils.response_helper import success
from ..utils.datetime_helper import serialize_list
from ..middleware.auth_middleware import jwt_required_custom


@jwt_required_custom
def get_notifications():
    user_id = get_jwt_identity()
    unread_only = request.args.get("unread_only", "false").lower() == "true"
    notifications = NotificationModel.list_for_user(user_id, unread_only=unread_only)
    return success(serialize_list(notifications))


@jwt_required_custom
def mark_read(notif_id):
    NotificationModel.mark_read(notif_id)
    return success(message="Notification marked as read")


@jwt_required_custom
def mark_all_read():
    user_id = get_jwt_identity()
    NotificationModel.mark_all_read(user_id)
    return success(message="All notifications marked as read")


@jwt_required_custom
def unread_count():
    user_id = get_jwt_identity()
    count = NotificationModel.unread_count(user_id)
    return success({"count": count})
