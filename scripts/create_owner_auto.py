import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app import create_app
from backend.app.models.user_model import UserModel
from backend.app.utils.password_helper import hash_password

app = create_app()
with app.app_context():
    existing = UserModel.find_by_email("admin@newspaper.com")
    if existing:
        print("Owner already exists.")
        print("Email   : admin@newspaper.com")
        print("Password: Admin@1234")
    else:
        UserModel.create({
            "name": "Admin Owner",
            "email": "admin@newspaper.com",
            "password_hash": hash_password("Admin@1234"),
            "role": "owner"
        })
        print("Owner created successfully!")
        print("Email   : admin@newspaper.com")
        print("Password: Admin@1234")
