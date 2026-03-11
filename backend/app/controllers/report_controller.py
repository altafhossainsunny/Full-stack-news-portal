from flask import request
from flask_jwt_extended import get_jwt_identity
from ..models.report_model import ReportModel
from ..models.activity_log_model import ActivityLogModel
from ..utils.response_helper import success, error, paginated
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..utils.file_helper import save_file
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("reporter", "editor", "owner", "publisher")
def submit_report():
    data = request.form.to_dict()
    user_id = get_jwt_identity()
    data["reporter_id"] = user_id

    media_files = []
    if "media" in request.files:
        for f in request.files.getlist("media"):
            try:
                saved = save_file(f, "reports")
                media_files.append(saved["url"])
            except ValueError as e:
                return error(str(e), 400)

    audio_url = None
    if "audio" in request.files:
        try:
            saved = save_file(request.files["audio"], "reports")
            audio_url = saved["url"]
        except ValueError as e:
            return error(str(e), 400)

    data["media_files"] = media_files
    data["audio_file"] = audio_url

    report_id = ReportModel.create(data)
    ActivityLogModel.log(user_id, "submit_report", "report", report_id)
    return success({"report_id": report_id}, "Report submitted", 201)


@roles_required("owner", "publisher", "editor")
def list_reports():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page
    reports = ReportModel.list_all(skip=skip, limit=per_page)
    return paginated(serialize_list(reports), 0, page, per_page)


@jwt_required_custom
def get_report(report_id):
    report = ReportModel.find_by_id(report_id)
    if not report:
        return error("Report not found", 404)
    return success(serialize_doc(report))


@roles_required("owner", "publisher", "editor")
def update_report_status(report_id):
    data = request.get_json()
    status = data.get("status")
    if status not in ReportModel.STATUSES:
        return error("Invalid status", 400)
    ReportModel.update(report_id, {"status": status, "feedback": data.get("feedback")})
    return success(message="Report status updated")


@roles_required("owner")
def delete_report(report_id):
    ReportModel.collection().delete_one({"_id": __import__("bson").ObjectId(report_id)})
    return success(message="Report deleted")


@roles_required("reporter", "editor", "owner", "publisher")
def my_reports():
    user_id = get_jwt_identity()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page
    from bson import ObjectId
    oid = ObjectId(user_id)
    col = ReportModel.collection()
    reports = list(col.find({"reporter_id": oid}).sort("created_at", -1).skip(skip).limit(per_page))
    total = col.count_documents({"reporter_id": oid})
    return paginated(serialize_list(reports), total, page, per_page)
