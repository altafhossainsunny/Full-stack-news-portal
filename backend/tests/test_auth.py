import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app("development")
    app.config["TESTING"] = True
    app.config["MONGO_URI"] = "mongodb://localhost:27017/bangladesh_newspaper_test"
    with app.test_client() as client:
        yield client


def test_login_missing_fields(client):
    res = client.post("/api/auth/login", json={})
    assert res.status_code == 400


def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={"email": "none@none.com", "password": "wrong"})
    assert res.status_code == 401


def test_register_missing_fields(client):
    res = client.post("/api/auth/register", json={"email": "test@test.com"})
    assert res.status_code == 400
