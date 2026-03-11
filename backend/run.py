from app import create_app

app = create_app()

def seed_dev_users():
    """Ensure the 4 test users always exist when the server starts."""
    import bcrypt
    from datetime import datetime, timezone
    from app.extensions import mongo

    test_users = [
        {"name": "System Owner",   "email": "owner@bgn.com",     "role": "owner"},
        {"name": "Lead Publisher", "email": "publisher@bgn.com", "role": "publisher"},
        {"name": "Senior Editor",  "email": "editor@bgn.com",    "role": "editor"},
        {"name": "Field Reporter", "email": "reporter@bgn.com",  "role": "reporter"},
    ]
    pw_hash = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
    now = datetime.now(timezone.utc)

    with app.app_context():
        for u in test_users:
            existing = mongo.db.users.find_one({"email": u["email"]})
            if existing:
                mongo.db.users.update_one(
                    {"email": u["email"]},
                    {"$set": {"password_hash": pw_hash, "is_active": True}}
                )
            else:
                mongo.db.users.insert_one({
                    **u,
                    "password_hash": pw_hash,
                    "is_active": True,
                    "created_at": now,
                    "last_login": None,
                    "profile_image": None,
                    "bio": "",
                })
        print("[seed] Dev users ensured.")

seed_dev_users()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

