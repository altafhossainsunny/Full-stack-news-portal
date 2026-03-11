from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS

mongo = PyMongo()
jwt = JWTManager()
mail = Mail()
cors = CORS()
