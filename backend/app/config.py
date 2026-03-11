import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/bangladesh_newspaper")

    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "app/static/uploads")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    CORS_ORIGINS = [
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]

    JWT_ACCESS_TOKEN_EXPIRES = 86400       # 24 hours
    JWT_REFRESH_TOKEN_EXPIRES = 2592000    # 30 days

    INVITATION_TOKEN_EXPIRY_HOURS = 72
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "mp3", "wav", "mp4", "pdf"}


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
