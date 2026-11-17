import pytest


def test_01_patient_registration_success(client):
    """Test Case: New patient registration."""
    payload = {
        "email": "alice_patient@example.com",
        "password": "Password123!",
        "full_name": "Alice Patient",
        "role": "PATIENT",
        "contact_number": "+1-555-0101",
        "emergency_contact": "+1-555-0102",
        "initial_condition": "Type 2 Diabetes",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "PATIENT"
    assert data["email"] == "alice_patient@example.com"
    assert data["full_name"] == "Alice Patient"


def test_02_duplicate_email_registration_rejected(client):
    """Test Case: Duplicate email registration rejected."""
    payload = {
        "email": "alice_patient@example.com",
        "password": "Password123!",
        "full_name": "Alice Duplicate",
        "role": "PATIENT",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_03_login_success(client):
    """Test Case: Correct login credentials."""
    payload = {
        "email": "alice_patient@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "PATIENT"


def test_04_login_wrong_password_rejected(client):
    """Test Case: Incorrect password rejected."""
    payload = {
        "email": "alice_patient@example.com",
        "password": "WrongPassword123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_05_patient_accessing_admin_rejected_403(client):
    """Test Case: Role-Based Access Control - Patient blocked from Admin API."""
    # 1. Login as patient
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alice_patient@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]

    # 2. Try accessing admin-only endpoint
    headers = {"Authorization": f"Bearer {token}"}
    admin_resp = client.get("/api/v1/admin/users", headers=headers)
    assert admin_resp.status_code == 403
    assert "access denied" in admin_resp.json()["detail"].lower()


def test_06_patient_profile_update(client):
    """Test Case: Patient updates profile details."""
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alice_patient@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update profile
    update_payload = {
        "contact_number": "+1-999-8888",
        "blood_group": "O+",
        "address": "456 Healthcare Ave, Suite 100",
    }
    resp = client.put("/api/v1/profiles/patient", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["blood_group"] == "O+"
    assert data["contact_number"] == "+1-999-8888"
    assert data["address"] == "456 Healthcare Ave, Suite 100"


def test_07_health_condition_crud(client):
    """Test Case: Adding and deleting health conditions."""
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "alice_patient@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add condition
    cond_resp = client.post("/api/v1/profiles/patient/conditions", json={
        "condition_name": "Hypertension",
        "severity": "Mild",
        "diagnosed_date": "2024-01-15",
        "notes": "Under regular monitoring",
    }, headers=headers)
    assert cond_resp.status_code == 201
    condition_id = cond_resp.json()["id"]

    # Verify present in profile
    prof_resp = client.get("/api/v1/profiles/patient", headers=headers)
    conditions = prof_resp.json()["health_conditions"]
    assert any(c["condition_name"] == "Hypertension" for c in conditions)

    # Delete condition
    del_resp = client.delete(f"/api/v1/profiles/patient/conditions/{condition_id}", headers=headers)
    assert del_resp.status_code == 204


def test_08_caregiver_assignment_and_monitoring(client):
    """Test Case: Admin registers caregiver, assigns to patient, and caregiver monitors patient."""
    # 1. Register Admin
    admin_reg = client.post("/api/v1/auth/register", json={
        "email": "admin_system@example.com",
        "password": "AdminPassword123!",
        "full_name": "Chief Administrator",
        "role": "ADMIN",
    })
    assert admin_reg.status_code == 201
    admin_token = admin_reg.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register Caregiver
    caregiver_reg = client.post("/api/v1/auth/register", json={
        "email": "bob_caregiver@example.com",
        "password": "CaregiverPassword123!",
        "full_name": "Bob Caregiver",
        "role": "CAREGIVER",
        "contact_number": "+1-555-0909",
    })
    assert caregiver_reg.status_code == 201
    caregiver_token = caregiver_reg.json()["access_token"]
    caregiver_headers = {"Authorization": f"Bearer {caregiver_token}"}

    # 3. Admin gets patient & caregiver profile IDs
    patients_list = client.get("/api/v1/admin/patients", headers=admin_headers).json()
    caregivers_list = client.get("/api/v1/admin/caregivers", headers=admin_headers).json()

    alice_patient_id = next(p["id"] for p in patients_list if "alice" in p["email"])
    bob_caregiver_id = next(c["id"] for c in caregivers_list if "bob" in c["email"])

    # 4. Admin assigns Bob to Alice via /api/v1/admin/assign-caregiver
    assign_resp = client.post("/api/v1/admin/assign-caregiver", json={
        "caregiver_id": bob_caregiver_id,
        "patient_id": alice_patient_id,
        "notes": "Primary family caregiver assigned by Admin",
    }, headers=admin_headers)
    assert assign_resp.status_code == 201

    # 5. Bob (Caregiver) fetches his profile and verifies Alice is in assigned_patients
    caregiver_profile_resp = client.get("/api/v1/profiles/caregiver", headers=caregiver_headers)
    assert caregiver_profile_resp.status_code == 200
    data = caregiver_profile_resp.json()
    assert len(data["assigned_patients"]) >= 1
    assert any(p["patient_name"] == "Alice Patient" for p in data["assigned_patients"])
