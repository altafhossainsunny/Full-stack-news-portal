from flask import request
from flask_jwt_extended import get_jwt_identity
from ..models.ad_model import AdModel
from ..utils.response_helper import success, error, paginated
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("owner", "publisher")
def create_ad():
    data = request.get_json()
    required = ["title", "image_url", "target_url", "placement"]
    if not all(data.get(f) for f in required):
        return error("title, image_url, target_url, and placement are required", 400)
    if data["placement"] not in AdModel.PLACEMENTS:
        return error(f"Invalid placement. Choose from: {AdModel.PLACEMENTS}", 400)
    data["created_by"] = get_jwt_identity()
    ad_id = AdModel.create(data)
    return success({"ad_id": ad_id}, "Ad created", 201)


@roles_required("owner", "publisher")
def list_ads():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page
    ads = AdModel.list_all(skip=skip, limit=per_page)
    total = AdModel.count()
    return paginated(serialize_list(ads), total, page, per_page)


@jwt_required_custom
def get_ad(ad_id):
    ad = AdModel.find_by_id(ad_id)
    if not ad:
        return error("Ad not found", 404)
    return success(serialize_doc(ad))


@roles_required("owner", "publisher")
def update_ad(ad_id):
    data = request.get_json()
    AdModel.update(ad_id, data)
    return success(message="Ad updated")


@roles_required("owner")
def delete_ad(ad_id):
    AdModel.delete(ad_id)
    return success(message="Ad deleted")


def track_click(ad_id):
    AdModel.track_click(ad_id)
    return success(message="Click tracked")


def track_impression(ad_id):
    AdModel.track_impression(ad_id)
    return success(message="Impression tracked")
