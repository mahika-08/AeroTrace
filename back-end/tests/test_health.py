
from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")

        assert response.status_code == 200
        assert response.json() == {
            "application": "AeroTrace",
            "status": "UP",
        }


def test_dashboard_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard")

        assert response.status_code == 200
        data = response.json()
        assert "total_events" in data
        assert "recent_events" in data


def test_events_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/events")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1


def test_event_detail_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/events/1")

        assert response.status_code == 200
        assert response.json()["pollutant"] == "PM2.5"


def test_missing_event_returns_404():
    with TestClient(app) as client:
        response = client.get("/api/v1/events/999999")

        assert response.status_code == 404