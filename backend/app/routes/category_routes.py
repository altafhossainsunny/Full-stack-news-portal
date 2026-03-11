from flask import Blueprint
from ..controllers.category_controller import (
    create_category, list_categories, get_category, update_category, delete_category
)

category_bp = Blueprint("categories", __name__)

category_bp.post("/")(create_category)
category_bp.get("/")(list_categories)
category_bp.get("/<cat_id>")(get_category)
category_bp.put("/<cat_id>")(update_category)
category_bp.delete("/<cat_id>")(delete_category)
