from flask import Blueprint
from ..controllers.newsletter_controller import newsletter_list

newsletter_bp = Blueprint("newsletter", __name__)
newsletter_bp.get("/")(newsletter_list)
