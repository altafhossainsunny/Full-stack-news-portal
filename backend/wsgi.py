"""Production WSGI entry point — used by gunicorn on Render.
Does NOT run seed_dev_users (that is dev-only and lives in run.py).
"""
from app import create_app

app = create_app()
