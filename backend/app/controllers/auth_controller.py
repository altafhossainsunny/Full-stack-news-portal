from flask import request
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required
from ..models.user_model import UserModel
from ..utils.password_helper import hash_password, check_password
from ..utils.response_helper import success, error
from ..utils.datetime_helper import serialize_doc
from datetime import datetime, timezone


def register():
    data = request.get_json()
    required = ["name", "email", "password", "role"]
    if not all(data.get(f) for f in required):
        return error("Missing required fields", 400)

    if UserModel.find_by_email(data["email"]):
        return error("Email already registered", 409)

    data["password_hash"] = hash_password(data["password"])
    user_id = UserModel.create(data)
    return success({"user_id": user_id}, "User registered", 201)


def login():
    data = request.get_json()
    if not data.get("email") or not data.get("password"):
        return error("Email and password required", 400)

    user = UserModel.find_by_email(data["email"])
    if not user or not check_password(data["password"], user["password_hash"]):
        return error("Invalid credentials", 401)

    if not user.get("is_active"):
        return error("Account suspended. Contact administrator.", 403)

    UserModel.update(str(user["_id"]), {"last_login": datetime.now(timezone.utc)})

    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return success({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    }, "Login successful")


@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return success({"access_token": access_token})


@jwt_required()
def logout():
    return success(message="Logged out successfully")


@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = UserModel.find_by_id(user_id)
    if not user:
        return error("User not found", 404)
    return success(serialize_doc(user))
