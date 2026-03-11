from flask import Blueprint
from ..controllers.invitation_controller import (
    send_invitation, list_invitations, revoke_invitation, verify_invitation, accept_invitation
)

invitation_bp = Blueprint("invitations", __name__)

invitation_bp.post("/send")(send_invitation)
invitation_bp.get("/")(list_invitations)
invitation_bp.post("/<invitation_id>/revoke")(revoke_invitation)
invitation_bp.get("/verify/<token>")(verify_invitation)
invitation_bp.post("/accept")(accept_invitation)
