#!/usr/bin/env python3
"""
Seed the database with default categories, corners, and tags.
Run with: conda run -n venv_news python scripts/seed_database.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.app.models.category_model import CategoryModel
from backend.app.models.corner_model import CornerModel
from backend.app.models.tag_model import TagModel
from backend.app.utils.slug_helper import slugify

DEFAULT_CATEGORIES = [
    {"name": "National", "description": "Domestic news from Bangladesh"},
    {"name": "International", "description": "Global news and world affairs"},
    {"name": "Politics", "description": "Political developments and analysis"},
    {"name": "Business", "description": "Economy, markets, and trade"},
    {"name": "Technology", "description": "Tech news and innovation"},
    {"name": "Sports", "description": "Sports coverage and results"},
    {"name": "Entertainment", "description": "Art, culture, and entertainment"},
    {"name": "Health", "description": "Health, medicine, and wellness"},
    {"name": "Environment", "description": "Climate and environmental news"},
    {"name": "Education", "description": "Education policy and academic news"},
]

DEFAULT_CORNERS = [
    {"name": "Opinion", "description": "Editorial opinions and commentary"},
    {"name": "Analysis", "description": "In-depth analysis and explainers"},
    {"name": "Youth Voice", "description": "Stories by and for young people"},
    {"name": "Diaspora", "description": "Bangladesh diaspora around the world"},
    {"name": "Investigative", "description": "Investigative journalism reports"},
]

DEFAULT_TAGS = [
    "dhaka", "chittagong", "sylhet", "bangladesh", "government", "parliament",
    "economy", "flooding", "election", "human-rights", "covid", "climate",
    "education", "healthcare", "technology", "startup", "cricket", "football",
]

def main():
    app = create_app()
    with app.app_context():
        print("Seeding categories…")
        for cat in DEFAULT_CATEGORIES:
            try:
                slug = slugify(cat["name"])
                if CategoryModel.find_by_slug(slug):
                    print(f"  - {cat['name']} (already exists)")
                    continue
                CategoryModel.create({**cat, "slug": slug})
                print(f"  ✓ {cat['name']}")
            except Exception as e:
                print(f"  ✗ {cat['name']}: {e}")

        print("\nSeeding corners…")
        for corner in DEFAULT_CORNERS:
            try:
                slug = slugify(corner["name"])
                if CornerModel.find_by_slug(slug):
                    print(f"  - {corner['name']} (already exists)")
                    continue
                CornerModel.create({**corner, "slug": slug, "created_by": None})
                print(f"  ✓ {corner['name']}")
            except Exception as e:
                print(f"  ✗ {corner['name']}: {e}")

        print("\nSeeding tags…")
        for tag in DEFAULT_TAGS:
            try:
                TagModel.get_or_create(tag)
                print(f"  ✓ {tag}")
            except Exception as e:
                print(f"  ✗ {tag}: {e}")

        print("\nDatabase seeded successfully!")

if __name__ == "__main__":
    main()
