import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from bson import ObjectId


ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "ogg", "m4a"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov"}
ALLOWED_ALL = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_AUDIO_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS


def allowed_file(filename: str, allowed: set = None) -> bool:
    allowed = allowed or ALLOWED_ALL
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


def _use_gridfs() -> bool:
    return os.getenv("USE_GRIDFS", "false").lower() == "true"


def save_file(file, folder: str) -> dict:
    """
    Save an uploaded Werkzeug FileStorage object.
    Uses MongoDB GridFS when USE_GRIDFS=true, otherwise local disk.
    Returns a dict with filename, url, mime_type, file_size.
    """
    if not file or not file.filename:
        raise ValueError("No file provided")

    if not allowed_file(file.filename):
        raise ValueError(f"File type not allowed: {file.filename}")

    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    if _use_gridfs():
        file_bytes = file.read()
        file_id = current_app.gridfs.put(
            file_bytes,
            filename=unique_name,
            content_type=file.content_type,
            folder=folder,
        )
        return {
            "filename": unique_name,
            "original_name": filename,
            "url": f"/api/media/file/{file_id}",
            "file_size": len(file_bytes),
            "mime_type": file.content_type,
        }

    upload_base = current_app.config["UPLOAD_FOLDER"]
    dest_folder = os.path.join(upload_base, folder)
    os.makedirs(dest_folder, exist_ok=True)
    filepath = os.path.join(dest_folder, unique_name)
    file.save(filepath)
    return {
        "filename": unique_name,
        "original_name": filename,
        "url": f"/static/uploads/{folder}/{unique_name}",
        "file_size": os.path.getsize(filepath),
        "mime_type": file.content_type,
    }


def delete_file(url: str):
    """Delete a file — from GridFS or local disk depending on the URL."""
    if not url:
        return
    if url.startswith("/api/media/file/"):
        file_id_str = url.split("/api/media/file/")[-1]
        try:
            current_app.gridfs.delete(ObjectId(file_id_str))
        except Exception:
            pass
    else:
        rel_path = url.lstrip("/")
        abs_path = os.path.join(os.getcwd(), "app", rel_path)
        if os.path.exists(abs_path):
            os.remove(abs_path)
