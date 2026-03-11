from flask import Blueprint
from ..controllers.report_controller import (
    submit_report, list_reports, get_report, update_report_status, delete_report,
    my_reports,
)

report_bp = Blueprint("reports", __name__)

report_bp.post("/")(submit_report)
report_bp.get("/")(list_reports)
report_bp.get("/my")(my_reports)
report_bp.get("/<report_id>")(get_report)
report_bp.put("/<report_id>/status")(update_report_status)
report_bp.delete("/<report_id>")(delete_report)
