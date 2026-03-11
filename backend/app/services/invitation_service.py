from flask_mail import Message
from flask import current_app, render_template
from ..extensions import mail


def send_invitation_email(invitation: dict):
    """Send an invitation email with the acceptance link."""
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
    accept_link = f"{frontend_url}/auth/accept-invitation?token={invitation['token']}"

    try:
        msg = Message(
            subject="You are invited to join the Newsroom",
            recipients=[invitation["email"]],
            html=render_template(
                "invitation_email.html",
                accept_link=accept_link,
                role=invitation["role"],
                expires_at=invitation["expires_at"],
            ),
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Failed to send invitation email: {e}")


def send_article_status_email(user_email: str, status: str, article_title: str, reason: str = None):
    """Notify author about article approval/rejection."""
    subject_map = {
        "approved": "Your article has been approved",
        "rejected": "Your article requires revision",
        "published": "Your article is now published",
    }
    subject = subject_map.get(status, "Article Status Update")

    try:
        msg = Message(
            subject=subject,
            recipients=[user_email],
            html=render_template(
                "article_status_email.html",
                status=status,
                article_title=article_title,
                reason=reason,
            ),
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Failed to send status email: {e}")
