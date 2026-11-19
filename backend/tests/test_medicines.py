import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def patient_token(client: TestClient) -> str:
    """Fixture providing a valid JWT bearer token for a test patient."""
    payload = {
        "email": "med_patient_unit@example.com",
        "password": "Password123!",
        "full_name": "Med Patient Unit",
        "role": "PATIENT",
    }
    reg_resp = client.post("/api/v1/auth/register", json=payload)
    if reg_resp.status_code == 201:
        return reg_resp.json()["access_token"]
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    return login_resp.json()["access_token"]


def test_01_create_medicine(client: TestClient, patient_token: str):
    """Test creating a new medicine with schedules."""
    payload = {
        "name": "Glipizide",
        "dosage": "5 mg",
        "form": "Tablet",
        "disease_category": "Diabetes",
        "frequency": "Twice daily",
        "meal_relation": "Before Meal",
        "current_stock": 20,
        "low_stock_threshold": 5,
        "instructions": "Take 30 minutes before meal.",
        "schedule_times": ["08:00", "18:00"],
    }
    response = client.post(
        "/api/v1/medicines",
        json=payload,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Glipizide"
    assert data["dosage"] == "5 mg"
    assert len(data["schedules"]) == 2
    assert data["is_low_stock"] is False


def test_02_get_medicines_and_filter(client: TestClient, patient_token: str):
    """Test retrieving medicines list and filtering by disease."""
    response = client.get(
        "/api/v1/medicines",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

    # Filter by Diabetes
    filter_resp = client.get(
        "/api/v1/medicines?disease=Diabetes",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert filter_resp.status_code == 200
    filtered = filter_resp.json()
    assert all("diabetes" in m["disease_category"].lower() for m in filtered)


def test_03_refill_medicine(client: TestClient, patient_token: str):
    """Test quick stock refill."""
    # First create a low stock medicine
    med_resp = client.post(
        "/api/v1/medicines",
        json={
            "name": "Levothyroxine",
            "dosage": "50 mcg",
            "form": "Tablet",
            "disease_category": "Thyroid",
            "frequency": "Once daily",
            "meal_relation": "Empty Stomach",
            "current_stock": 3,
            "low_stock_threshold": 5,
            "schedule_times": ["07:00"],
        },
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert med_resp.status_code == 201
    med_id = med_resp.json()["id"]
    assert med_resp.json()["is_low_stock"] is True

    # Refill +30 pills
    refill_resp = client.post(
        f"/api/v1/medicines/{med_id}/refill",
        json={"quantity": 30},
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert refill_resp.status_code == 200
    updated = refill_resp.json()
    assert updated["current_stock"] == 33
    assert updated["is_low_stock"] is False


def test_04_today_timeline_and_dose_action(client: TestClient, patient_token: str):
    """Test today's timeline retrieval and real-time dose taking with stock decrement."""
    # Create test medicine
    med_resp = client.post(
        "/api/v1/medicines",
        json={
            "name": "Amlodipine",
            "dosage": "5 mg",
            "form": "Tablet",
            "disease_category": "Blood Pressure",
            "frequency": "Once daily",
            "meal_relation": "Morning",
            "current_stock": 10,
            "low_stock_threshold": 3,
            "schedule_times": ["08:00"],
        },
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert med_resp.status_code == 201
    med_id = med_resp.json()["id"]

    # Get timeline
    timeline_resp = client.get(
        "/api/v1/medicines/timeline/today",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert timeline_resp.status_code == 200
    t_data = timeline_resp.json()
    assert "timeline" in t_data
    assert "adherence_percentage" in t_data

    # Mark dose as TAKEN
    action_resp = client.post(
        "/api/v1/medicines/doses/action",
        json={
            "medicine_id": med_id,
            "scheduled_time": "08:00",
            "action": "TAKEN",
        },
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert action_resp.status_code == 200
    act_data = action_resp.json()
    assert act_data["taken_doses"] >= 1

    # Verify stock decremented from 10 to 9
    detail_resp = client.get(
        f"/api/v1/medicines/{med_id}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert detail_resp.status_code == 200
    assert detail_resp.json()["current_stock"] == 9


def test_05_delete_medicine(client: TestClient, patient_token: str):
    """Test soft deleting a medicine."""
    med_resp = client.post(
        "/api/v1/medicines",
        json={
            "name": "Temporary Med",
            "dosage": "100 mg",
            "form": "Tablet",
            "disease_category": "General",
            "current_stock": 5,
            "low_stock_threshold": 2,
            "schedule_times": ["12:00"],
        },
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    med_id = med_resp.json()["id"]

    del_resp = client.delete(
        f"/api/v1/medicines/{med_id}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert del_resp.status_code == 204

    # Now get detail should return 404
    get_resp = client.get(
        f"/api/v1/medicines/{med_id}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert get_resp.status_code == 404
