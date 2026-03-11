#!/usr/bin/env python3
"""
Create the initial Owner account.
Run with: conda run -n venv_news python scripts/create_owner.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.app.models.user_model import UserModel
from backend.app.utils.password_helper import hash_password

def main():
    app = create_app()
    with app.app_context():
        name = input("Owner name: ").strip()
        email = input("Owner email: ").strip().lower()
        password = input("Owner password (min 8 chars): ").strip()

        if not name or not email or len(password) < 8:
            print("All fields required; password must be at least 8 characters.")
            sys.exit(1)

        existing = UserModel.find_by_email(email)
        if existing:
            print(f"Error: User with email {email} already exists.")
            sys.exit(1)

        user_id = UserModel.create({
            "name": name,
            "email": email,
            "password_hash": hash_password(password),
            "role": "owner",
            "is_active": True,
        })
        print(f"\nOwner account created successfully!")
        print(f"  Name : {name}")
        print(f"  Email: {email}")
        print(f"  ID   : {user_id}")

if __name__ == "__main__":
    main()
