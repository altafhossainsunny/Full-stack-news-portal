from flask import request
from ..models.category_model import CategoryModel
from ..utils.response_helper import success, error
from ..utils.datetime_helper import serialize_doc, serialize_list
from ..utils.slug_helper import unique_slug
from ..middleware.auth_middleware import roles_required, jwt_required_custom


@roles_required("owner", "publisher")
def create_category():
    data = request.get_json()
    if not data.get("name"):
        return error("Name is required", 400)
    data["slug"] = unique_slug(data["name"], lambda s: CategoryModel.find_by_slug(s) is not None)
    cat_id = CategoryModel.create(data)
    return success({"category_id": cat_id}, "Category created", 201)


@jwt_required_custom
def list_categories():
    active_only = request.args.get("active_only", "false").lower() == "true"
    cats = CategoryModel.list_all(active_only=active_only)
    return success(serialize_list(cats))


@jwt_required_custom
def get_category(cat_id):
    cat = CategoryModel.find_by_id(cat_id)
    if not cat:
        return error("Category not found", 404)
    return success(serialize_doc(cat))


@roles_required("owner", "publisher")
def update_category(cat_id):
    data = request.get_json()
    CategoryModel.update(cat_id, data)
    return success(message="Category updated")


@roles_required("owner")
def delete_category(cat_id):
    CategoryModel.delete(cat_id)
    return success(message="Category deleted")
