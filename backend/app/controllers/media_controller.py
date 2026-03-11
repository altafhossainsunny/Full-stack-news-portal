import gridfs as _gridfs
from flask import request, Response, current_app
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from ..models.media_model import MediaModel
from ..utils.response_helper import success, error, paginated
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..utils.file_helper import save_file, delete_file
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("owner", "publisher", "editor")
def upload_media():
    if "file" not in request.files:
        return error("No file provided", 400)

    folder = request.form.get("folder", "articles")
    user_id = get_jwt_identity()

    try:
        saved = save_file(request.files["file"], folder)
    except ValueError as e:
        return error(str(e), 400)

    ext = saved["filename"].rsplit(".", 1)[-1].lower()
    if ext in {"png", "jpg", "jpeg", "gif", "webp"}:
        file_type = "image"
    elif ext in {"mp3", "wav", "ogg"}:
        file_type = "audio"
    elif ext in {"mp4", "webm", "mov"}:
        file_type = "video"
    else:
        file_type = "document"

    media_id = MediaModel.create({
        **saved,
        "file_type": file_type,
        "folder": folder,
        "alt_text": request.form.get("alt_text", ""),
        "uploaded_by": user_id,
    })

    return success({"media_id": media_id, "url": saved["url"]}, "File uploaded", 201)


@roles_required("owner", "publisher", "editor")
def list_media():
    folder = request.args.get("folder", "articles")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 30))
    skip = (page - 1) * per_page
    media = MediaModel.list_by_folder(folder, skip=skip, limit=per_page)
    return paginated(serialize_list(media), 0, page, per_page)


@roles_required("owner", "publisher", "editor")
def delete_media(media_id):
    media = MediaModel.find_by_id(media_id)
    if not media:
        return error("Media not found", 404)
    delete_file(media.get("url"))
    MediaModel.delete(media_id)
    return success(message="Media deleted")


def serve_media_file(file_id):
    """Public endpoint — stream a file from MongoDB GridFS."""
    try:
        oid = ObjectId(file_id)
    except Exception:
        return error("Invalid file ID", 400)

    try:
        grid_file = current_app.gridfs.get(oid)
    except _gridfs.errors.NoFile:
        return error("File not found", 404)

    return Response(
        grid_file.read(),
        status=200,
        mimetype=grid_file.content_type or "application/octet-stream",
        headers={"Cache-Control": "public, max-age=31536000"},
    )
