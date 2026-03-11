from flask import request, current_app, render_template
from flask_mail import Message
from ..models.newsletter_model import NewsletterModel
from ..utils.response_helper import success, error
from ..middleware.auth_middleware import roles_required


def newsletter_subscribe():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()
    if not email or "@" not in email:
        return error("A valid email address is required", 400)

    subscriber, status = NewsletterModel.subscribe(email)
    if status == "already_subscribed":
        return error("This email is already subscribed", 409)

    # Send welcome email (non-blocking — failure doesn't break the subscription)
    try:
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        unsubscribe_link = f"{frontend_url}/newsletter/unsubscribe?token={subscriber['unsubscribe_token']}"
        msg = Message(
            subject="Welcome to BGN Daily Newsletter",
            recipients=[email],
            html=render_template(
                "newsletter_welcome.html",
                email=email,
                unsubscribe_link=unsubscribe_link,
            ),
        )
        from ..extensions import mail
        mail.send(msg)
    except Exception as e:
        current_app.logger.warning(f"Failed to send newsletter welcome email: {e}")

    return success(message="Successfully subscribed! Check your inbox.", status=201)


def newsletter_unsubscribe(token):
    if not token:
        return error("Invalid unsubscribe link", 400)
    ok = NewsletterModel.unsubscribe(token)
    if not ok:
        return error("Invalid or already unsubscribed", 404)
    return success(message="You have been unsubscribed.")


@roles_required("owner", "publisher")
def newsletter_list():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    skip = (page - 1) * per_page
    subscribers = NewsletterModel.list_active(skip=skip, limit=per_page)
    total = NewsletterModel.count_active()
    return success({"subscribers": subscribers, "total": total})
