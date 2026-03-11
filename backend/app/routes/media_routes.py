from flask import Blueprint
from ..controllers.media_controller import upload_media, list_media, delete_media, serve_media_file

media_bp = Blueprint("media", __name__)

media_bp.post("/upload")(upload_media)
media_bp.get("/")(list_media)
media_bp.delete("/<media_id>")(delete_media)
media_bp.get("/file/<file_id>")(serve_media_file)  # public — no auth
