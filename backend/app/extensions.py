from pymongo import MongoClient
import certifi
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS


class _MongoWrapper:
    """Minimal Flask-PyMongo-compatible wrapper using direct PyMongo with certifi TLS."""

    def __init__(self):
        self.cx = None
        self._db = None

    def init_app(self, app):
        uri = app.config.get("MONGO_URI", "mongodb://localhost:27017/bangladesh_newspaper")
        # Extract database name from URI path component
        db_name = uri.split("/")[-1].split("?")[0] or "bangladesh_newspaper"
        self.cx = MongoClient(uri, tlsCAFile=certifi.where())
        self._db = self.cx[db_name]

    @property
    def db(self):
        return self._db


mongo = _MongoWrapper()
jwt = JWTManager()
mail = Mail()
cors = CORS()
