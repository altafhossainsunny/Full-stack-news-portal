from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.invitation_model import InvitationModel
from ..models.user_model import UserModel
from ..utils.response_helper import success, error
from ..utils.password_helper import hash_password
from ..middleware.auth_middleware import roles_required
from ..services.invitation_service import send_invitation_email
from flask import current_app


@roles_required("owner")
def send_invitation():
    data = request.get_json()
    if not data.get("email") or not data.get("role"):
        return error("Email and role are required", 400)

    if data["role"] not in UserModel.ROLES:
        return error("Invalid role", 400)

    existing = InvitationModel.find_by_email(data["email"])
    if existing:
        return error("A pending invitation already exists for this email", 409)

    if UserModel.find_by_email(data["email"]):
        return error("User with this email already exists", 409)

    user_id = get_jwt_identity()
    invitation = InvitationModel.create(user_id, data["email"], data["role"],
                                        current_app.config["INVITATION_TOKEN_EXPIRY_HOURS"])

    send_invitation_email(invitation)

    return success({"token": invitation["token"]}, "Invitation sent", 201)


@roles_required("owner", "publisher")
def list_invitations():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page
    invitations = InvitationModel.list_all(skip=skip, limit=per_page)
    return success(invitations)


@roles_required("owner")
def revoke_invitation(invitation_id):
    InvitationModel.revoke(invitation_id)
    return success(message="Invitation revoked")


def verify_invitation(token):
    from datetime import datetime, timezone
    invitation = InvitationModel.find_by_token(token)
    if not invitation:
        return error("Invalid or expired invitation", 404)

    if invitation["status"] != "pending":
        return error(f"Invitation is {invitation['status']}", 400)

    if invitation["expires_at"] < datetime.now(timezone.utc):
        InvitationModel.collection().update_one(
            {"token": token}, {"$set": {"status": "expired"}}
        )
        return error("Invitation has expired", 400)

    return success({
        "email": invitation["email"],
        "role": invitation["role"],
        "expires_at": invitation["expires_at"].isoformat(),
    })


def accept_invitation():
    data = request.get_json()
    token = data.get("token")
    password = data.get("password")
    name = data.get("name")

    if not token or not password or not name:
        return error("Token, name, and password are required", 400)

    invitation = InvitationModel.find_by_token(token)
    if not invitation:
        return error("Invalid or expired invitation", 404)

    if invitation["status"] != "pending":
        return error(f"Invitation is {invitation['status']}", 400)

    from datetime import datetime, timezone
    if invitation["expires_at"] < datetime.now(timezone.utc):
        InvitationModel.collection().update_one(
            {"token": token}, {"$set": {"status": "expired"}}
        )
        return error("Invitation has expired", 400)

    if UserModel.find_by_email(invitation["email"]):
        return error("An account with this email already exists", 409)

    user_id = UserModel.create({
        "name": name,
        "email": invitation["email"],
        "password_hash": hash_password(password),
        "role": invitation["role"],
    })

    InvitationModel.accept(token)

    return success({"user_id": user_id}, "Account created successfully", 201)
