from flask import Blueprint
from ..controllers.dashboard_controller import (
    owner_stats, publisher_stats, editor_stats, reporter_stats, activity_logs
)

dashboard_bp = Blueprint("dashboard", __name__)

dashboard_bp.get("/owner")(owner_stats)
dashboard_bp.get("/publisher")(publisher_stats)
dashboard_bp.get("/editor")(editor_stats)
dashboard_bp.get("/reporter")(reporter_stats)
dashboard_bp.get("/activity-logs")(activity_logs)
