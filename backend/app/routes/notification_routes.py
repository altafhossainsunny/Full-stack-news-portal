from flask import Blueprint
from ..controllers.notification_controller import (
    get_notifications, mark_read, mark_all_read, unread_count
)

notification_bp = Blueprint("notifications", __name__)

notification_bp.get("/")(get_notifications)
notification_bp.post("/<notif_id>/read")(mark_read)
notification_bp.post("/read-all")(mark_all_read)
notification_bp.get("/unread-count")(unread_count)
