from flask import Blueprint
from ..controllers.auth_controller import register, login, refresh, logout, me

auth_bp = Blueprint("auth", __name__)

auth_bp.post("/register")(register)
auth_bp.post("/login")(login)
auth_bp.post("/refresh")(refresh)
auth_bp.post("/logout")(logout)
auth_bp.get("/me")(me)
