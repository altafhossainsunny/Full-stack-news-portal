from flask import Blueprint
from ..controllers.ad_controller import (
    create_ad, list_ads, get_ad, update_ad, delete_ad, track_click, track_impression
)

ad_bp = Blueprint("ads", __name__)

ad_bp.post("/")(create_ad)
ad_bp.get("/")(list_ads)
ad_bp.get("/<ad_id>")(get_ad)
ad_bp.put("/<ad_id>")(update_ad)
ad_bp.delete("/<ad_id>")(delete_ad)
ad_bp.post("/<ad_id>/click")(track_click)
ad_bp.post("/<ad_id>/impression")(track_impression)
