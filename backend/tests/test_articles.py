import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app("development")
    app.config["TESTING"] = True
    app.config["MONGO_URI"] = "mongodb://localhost:27017/bangladesh_newspaper_test"
    with app.test_client() as client:
        yield client


def test_create_article_unauthorized(client):
    res = client.post("/api/articles/", json={"title": "Test", "content": "Hello"})
    assert res.status_code == 401


def test_public_homepage(client):
    res = client.get("/api/public/homepage")
    assert res.status_code == 200
