import os
from flask import Flask, request
from .config import config_map
from .extensions import mongo, jwt, mail, cors


def create_app(env: str = None) -> Flask:
    env = env or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_map.get(env, config_map["development"]))

    # Extensions
    mongo.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

    # Ensure CORS headers are on ALL responses including 500 errors
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        return response

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            from flask import make_response
            res = make_response()
            res.headers["Access-Control-Allow-Origin"] = "*"
            res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            res.headers["Access-Control-Max-Age"] = "86400"
            return res, 204

    # GridFS for production image storage
    from gridfs import GridFS
    with app.app_context():
        app.gridfs = GridFS(mongo.db)

    # Ensure upload folders exist (used when USE_GRIDFS is not set)
    for folder in ["articles", "reports", "ads", "live", "temp"]:
        os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], folder), exist_ok=True)

    @app.route("/")
    def index():
        return {
            "status": "online",
            "message": "Welcome to the Bangladesh Global Newspaper API",
            "version": "1.0"
        }

    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.invitation_routes import invitation_bp
    from .routes.user_routes import user_bp
    from .routes.article_routes import article_bp
    from .routes.report_routes import report_bp
    from .routes.translation_routes import translation_bp
    from .routes.category_routes import category_bp
    from .routes.corner_routes import corner_bp
    from .routes.tag_routes import tag_bp
    from .routes.ad_routes import ad_bp
    from .routes.media_routes import media_bp
    from .routes.live_routes import live_bp
    from .routes.notification_routes import notification_bp
    from .routes.comment_routes import comment_bp
    from .routes.dashboard_routes import dashboard_bp
    from .routes.public_routes import public_bp
    from .routes.newsletter_routes import newsletter_bp

    blueprints = [
        (auth_bp, "/api/auth"),
        (invitation_bp, "/api/invitations"),
        (user_bp, "/api/users"),
        (article_bp, "/api/articles"),
        (report_bp, "/api/reports"),
        (translation_bp, "/api/translations"),
        (category_bp, "/api/categories"),
        (corner_bp, "/api/corners"),
        (tag_bp, "/api/tags"),
        (ad_bp, "/api/ads"),
        (media_bp, "/api/media"),
        (live_bp, "/api/live"),
        (notification_bp, "/api/notifications"),
        (comment_bp, "/api/comments"),
        (dashboard_bp, "/api/dashboard"),
        (public_bp, "/api/public"),
        (newsletter_bp, "/api/newsletter"),
    ]

    for bp, prefix in blueprints:
        app.register_blueprint(bp, url_prefix=prefix)

    from .middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    return app
