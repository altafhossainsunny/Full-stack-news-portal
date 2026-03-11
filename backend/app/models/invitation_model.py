from datetime import datetime, timezone
import secrets
from bson import ObjectId
from ..extensions import mongo


class InvitationModel:
    COLLECTION = "invitations"

    STATES = ["pending", "accepted", "expired", "revoked"]

    @staticmethod
    def collection():
        return mongo.db[InvitationModel.COLLECTION]

    @staticmethod
    def create(invited_by: str, email: str, role: str, expiry_hours: int = 72) -> dict:
        from datetime import timedelta
        token = secrets.token_urlsafe(48)
        invitation = {
            "token": token,
            "email": email.lower().strip(),
            "role": role,
            "invited_by": ObjectId(invited_by),
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=expiry_hours),
            "accepted_at": None,
        }
        InvitationModel.collection().insert_one(invitation)
        return invitation

    @staticmethod
    def find_by_token(token: str):
        return InvitationModel.collection().find_one({"token": token})

    @staticmethod
    def find_by_email(email: str):
        return InvitationModel.collection().find_one(
            {"email": email.lower().strip(), "status": "pending"}
        )

    @staticmethod
    def accept(token: str):
        return InvitationModel.collection().update_one(
            {"token": token},
            {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc)}},
        )

    @staticmethod
    def revoke(invitation_id: str):
        return InvitationModel.collection().update_one(
            {"_id": ObjectId(invitation_id)}, {"$set": {"status": "revoked"}}
        )

    @staticmethod
    def list_all(skip=0, limit=20):
        cursor = InvitationModel.collection().find({}).sort("created_at", -1).skip(skip).limit(limit)
        docs = []
        for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            doc["invited_by"] = str(doc["invited_by"])
            for field in ("created_at", "expires_at", "accepted_at"):
                if doc.get(field) is not None:
                    doc[field] = doc[field].isoformat()
            docs.append(doc)
        return docs
