from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..models.user_model import UserModel


def jwt_required_custom(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({"error": "Authentication required"}), 401
        return fn(*args, **kwargs)
    return wrapper


def roles_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception:
                return jsonify({"error": "Authentication required"}), 401
            user_id = get_jwt_identity()
            user = UserModel.find_by_id(user_id)
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            if user.get("role") not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            if not user.get("is_active"):
                return jsonify({"error": "Account is suspended"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    user_id = get_jwt_identity()
    return UserModel.find_by_id(user_id)
