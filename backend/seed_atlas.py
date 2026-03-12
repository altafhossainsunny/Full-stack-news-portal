"""Seed 4 test users into MongoDB Atlas."""
import bcrypt
import certifi
from pymongo import MongoClient
from datetime import datetime, timezone

URI = "mongodb+srv://altafhossain_db_user:tglBrY51x5QrrlUq@cluster0.hzrjpia.mongodb.net/bangladesh_newspaper?appName=Cluster0"
client = MongoClient(URI, tlsCAFile=certifi.where())
db = client["bangladesh_newspaper"]

def hash_pw(p):
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

users = [
    {"name": "System Owner",   "email": "owner@bgn.com",     "role": "owner"},
    {"name": "Lead Publisher", "email": "publisher@bgn.com", "role": "publisher"},
    {"name": "Senior Editor",  "email": "editor@bgn.com",    "role": "editor"},
    {"name": "Field Reporter", "email": "reporter@bgn.com",  "role": "reporter"},
]

pw_hash = hash_pw("password123")
now = datetime.now(timezone.utc)

for u in users:
    existing = db.users.find_one({"email": u["email"]})
    if existing:
        db.users.update_one(
            {"email": u["email"]},
            {"$set": {"password_hash": pw_hash, "is_active": True}}
        )
        print(f"Updated: {u['email']}")
    else:
        db.users.insert_one({
            **u,
            "password_hash": pw_hash,
            "is_active": True,
            "created_at": now,
            "last_login": None,
            "profile_image": None,
            "bio": "",
        })
        print(f"Created: {u['email']}")

print(f"Done. Total users in Atlas: {db.users.count_documents({})}")
