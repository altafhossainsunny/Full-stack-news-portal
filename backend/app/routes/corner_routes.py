from flask import Blueprint
from ..controllers.corner_controller import (
    create_corner, list_corners, get_corner, update_corner, delete_corner
)

corner_bp = Blueprint("corners", __name__)

corner_bp.post("/")(create_corner)
corner_bp.get("/")(list_corners)
corner_bp.get("/<corner_id>")(get_corner)
corner_bp.put("/<corner_id>")(update_corner)
corner_bp.delete("/<corner_id>")(delete_corner)
