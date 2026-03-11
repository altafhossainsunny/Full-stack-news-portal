from flask import Blueprint
from ..controllers.tag_controller import list_tags, search_tags

tag_bp = Blueprint("tags", __name__)

tag_bp.get("/")(list_tags)
tag_bp.get("/search")(search_tags)
