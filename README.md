# PillSync: AI-Driven Medication Recognition & Personalized Reminder Platform

**PillSync** is an intelligent healthcare platform designed to streamline medication adherence for patients, provide remote clinical supervision for caregivers, and offer centralized user governance for administrators.

---

## 🎯 Milestone 1: Requirements, Database Design & Core Setup (Weeks 1 & 2)

### Milestone 1 Status: **100% Achieved & Verified ✓**

| Step | Requirement | Implementation in PillSync | Status |
| :--- | :--- | :--- | :--- |
| **Step 1** | Project Requirements & Healthcare Workflows | Identified 3 distinct roles: **Patient**, **Caregiver**, and **Admin**. Documented clinical supervision and reminder workflows. | **Achieved ✓** |
| **Step 2** | Database Design & Schema Creation | Designed 6 normalized relational tables with primary keys, foreign keys, and indexes using SQLAlchemy ORM. | **Achieved ✓** |
| **Step 3** | UI Wireframe Design | Created responsive clinical UI screens matching modern healthcare standards (`#0B1437` dark sidebar layout). | **Achieved ✓** |
| **Step 4** | Frontend Development (React.js) | Developed with **React 18 + Vite + Tailwind CSS + Lucide Icons**. Fast, responsive, zero-error build. | **Achieved ✓** |
| **Step 5** | Backend Development (Python / FastAPI) | High-performance asynchronous REST API built with **FastAPI**, Pydantic v2 schemas, and dependency injection. | **Achieved ✓** |
| **Step 6** | Database Integration | Integrated SQLAlchemy connection with automated table generation and pre-seeded clinical test datasets. | **Achieved ✓** |
| **Step 7** | User Registration & Login | Secure registration with duplicate email validation, **bcrypt** password hashing, and **JWT** session generation. Includes in-app modal and one-click Clear. | **Achieved ✓** |
| **Step 8** | Role-Based Access Control (RBAC) | Strict backend API protection via `require_role(['PATIENT', 'CAREGIVER', 'ADMIN'])` guards and dynamic UI views. | **Achieved ✓** |
| **Step 9** | Profile Management | Full CRUD for Patient Profiles, Emergency Contacts, Chronic Health Conditions, Caregiver Credentials, and Admin Assignments. | **Achieved ✓** |
| **Step 10** | End-to-End System Integration | Frontend connected seamlessly to backend via Axios with live state synchronization and error handling. | **Achieved ✓** |
| **Step 11** | Testing & Error Handling | Complete automated test suite using **pytest** covering all authentication, RBAC, profile, and failure scenarios (**15/15 passed**). | **Achieved ✓** |
| **Step 12** | GitHub Management | Structured repository, clean commits, comprehensive documentation, and isolated guide-approval branch strategy. | **Achieved ✓** |

---

## 🗄️ Database Architecture (6 Core Tables)

1. **`users`**: User ID, email, bcrypt-hashed password, full name, active status, role foreign key, timestamps.
2. **`roles`**: Role ID, name (`PATIENT`, `CAREGIVER`, `ADMIN`), description.
3. **`patient_profiles`**: Personal medical record, contact number, emergency contact, blood group, date of birth, home address.
4. **`caregiver_profiles`**: Professional credentials, contact number, qualification (e.g. CNA), relationship role.
5. **`caregiver_assignments`**: Links `caregiver_id` with `patient_id`, active status, custom supervision notes, assignment timestamp.
6. **`health_conditions`**: Patient's chronic diagnoses (e.g., Type 2 Diabetes, Hypertension), severity tag (`High`, `Moderate`, `Low`), diagnosed date, clinical notes.

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows:
.\venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI development server
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Swagger Interactive API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
- **Application URL:** [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🔑 Demo Login Credentials for Evaluation

| Role | Email | Password | Primary Feature Access |
| :--- | :--- | :--- | :--- |
| **👤 Patient** | `anu@gmail.com` | `Password123!` | Medication Tracker, Vitals Telemetry, Chronic Health Conditions CRUD |
| **🩺 Caregiver** | `bob_caregiver@example.com` | `CaregiverPassword123!` | Supervised Patients Grid, Emergency Contacts, Live Intake Inspection |
| **🛡️ Admin** | `admin_system@example.com` | `AdminPassword123!` | Platform Overview KPIs, Assign Caregiver to Patient, User Directory |

*(Note: The top header in the UI includes a **1-Click Role Switcher** so evaluators can switch between roles instantly without manual re-typing).*

---

## 🧪 Automated Test Verification

Run all test suites:
```bash
backend\venv\Scripts\pytest -v backend\tests
```
**Test Results: 15 passed, 0 failures (100% success rate)**
- `test_milestone1.py`: 8/8 tests passed (Registration, duplicate check, login, wrong password rejection, 403 access denial, profile update, condition CRUD, caregiver assignment).
- `test_medicines.py`: 7/7 tests passed (Medicine CRUD, daily timeline, refill inventory, real-time dose actions, delete).

---

## 🗺️ Curriculum Trajectory

- **Milestone 1 (Weeks 1 & 2):** Requirements, Database Design, Core Setup, JWT Auth, RBAC & Profiles — **COMPLETED ✓**
- **Milestone 2 (Weeks 3 & 4):** Medication Scheduling, Dynamic Reminders & Web Audio Synth — **IN PROGRESS**
- **Milestone 3 (Weeks 5 & 6):** AI-Driven Prescription Recognition (Computer Vision OCR) — **UPCOMING**
- **Milestone 4 (Week 7):** Predictive Refill Forecasting & Inventory Optimization — **UPCOMING**
- **Milestone 5 (Week 8):** Cloud Deployment, Production Testing & Final Viva — **UPCOMING**
