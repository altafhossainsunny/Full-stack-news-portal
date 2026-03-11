from flask import request
from flask_jwt_extended import get_jwt_identity
from ..models.live_stream_model import LiveStreamModel
from ..models.live_update_model import LiveUpdateModel
from ..utils.response_helper import success, error
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("owner", "publisher")
def start_stream():
    data = request.get_json()
    # accept embed_url as alias for stream_url
    if not data.get("stream_url") and data.get("embed_url"):
        data["stream_url"] = data.pop("embed_url")
    if not data.get("title") or not data.get("stream_url"):
        return error("Title and stream URL are required", 400)
    data["created_by"] = get_jwt_identity()
    stream_id = LiveStreamModel.create(data)
    return success({"stream_id": stream_id}, "Stream started", 201)


@roles_required("owner", "publisher")
def end_stream(stream_id):
    LiveStreamModel.end_stream(stream_id)
    return success(message="Stream ended")


def get_active_stream():
    stream = LiveStreamModel.find_active()
    return success(serialize_doc(stream))


@jwt_required_custom
def list_streams():
    streams = LiveStreamModel.list_all()
    return success(serialize_list(streams))


@roles_required("owner", "publisher", "editor")
def add_live_update():
    data = request.get_json()
    if not data.get("content"):
        return error("Content is required", 400)
    data["posted_by"] = get_jwt_identity()
    update_id = LiveUpdateModel.create(data)
    return success({"update_id": update_id}, "Update posted", 201)


def get_live_updates():
    stream_id = request.args.get("stream_id")
    if stream_id:
        updates = LiveUpdateModel.list_by_stream(stream_id)
    else:
        updates = LiveUpdateModel.list_recent()
    return success(serialize_list(updates))
