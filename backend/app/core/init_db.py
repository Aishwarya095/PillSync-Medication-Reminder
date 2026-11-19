from sqlalchemy.orm import Session
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.models.medicine import Medicine, MedicineSchedule


def init_db(db: Session = None) -> None:
    """Create all tables and seed initial roles and default demo medications."""
    Base.metadata.create_all(bind=engine)

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        roles_to_seed = [
            {"name": "PATIENT", "description": "Patient managing personal medications and health conditions"},
            {"name": "CAREGIVER", "description": "Caregiver monitoring assigned patients"},
            {"name": "ADMIN", "description": "Platform administrator managing users and assignments"},
        ]

        for role_data in roles_to_seed:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                new_role = Role(name=role_data["name"], description=role_data["description"])
                db.add(new_role)

        db.commit()

        # Seed starter medications for existing demo patient accounts if empty
        patient_users = db.query(User).join(Role).filter(Role.name == "PATIENT").all()
        for patient in patient_users:
            med_count = db.query(Medicine).filter(Medicine.user_id == patient.id, Medicine.is_active == True).count()
            if med_count == 0:
                demo_meds = [
                    {
                        "name": "Metformin",
                        "dosage": "500 mg",
                        "form": "Tablet",
                        "disease_category": "Diabetes",
                        "frequency": "Twice daily",
                        "meal_relation": "After Meal",
                        "current_stock": 24,
                        "low_stock_threshold": 5,
                        "instructions": "Take with water immediately after breakfast and dinner.",
                        "times": ["08:00", "20:00"],
                    },
                    {
                        "name": "Lisinopril",
                        "dosage": "10 mg",
                        "form": "Tablet",
                        "disease_category": "Blood Pressure",
                        "frequency": "Once daily",
                        "meal_relation": "Before Meal",
                        "current_stock": 12,
                        "low_stock_threshold": 5,
                        "instructions": "Take once every morning before eating.",
                        "times": ["09:00"],
                    },
                    {
                        "name": "Atorvastatin",
                        "dosage": "20 mg",
                        "form": "Tablet",
                        "disease_category": "Heart Health",
                        "frequency": "Once daily",
                        "meal_relation": "After Meal",
                        "current_stock": 4,  # Triggers low-stock alert!
                        "low_stock_threshold": 5,
                        "instructions": "Take at bedtime with water.",
                        "times": ["21:00"],
                    },
                    {
                        "name": "Vitamin D3",
                        "dosage": "1000 IU",
                        "form": "Capsule",
                        "disease_category": "Wellness",
                        "frequency": "Once daily",
                        "meal_relation": "With Food",
                        "current_stock": 30,
                        "low_stock_threshold": 5,
                        "instructions": "Take with lunch to support calcium absorption.",
                        "times": ["13:00"],
                    },
                ]

                for m_data in demo_meds:
                    med = Medicine(
                        user_id=patient.id,
                        name=m_data["name"],
                        dosage=m_data["dosage"],
                        form=m_data["form"],
                        disease_category=m_data["disease_category"],
                        frequency=m_data["frequency"],
                        meal_relation=m_data["meal_relation"],
                        current_stock=m_data["current_stock"],
                        low_stock_threshold=m_data["low_stock_threshold"],
                        instructions=m_data["instructions"],
                    )
                    db.add(med)
                    db.flush()

                    for t in m_data["times"]:
                        sched = MedicineSchedule(
                            medicine_id=med.id,
                            time_str=t,
                            label=f"{t} Dose",
                        )
                        db.add(sched)

                db.commit()

    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    init_db()
    print("Database tables created and starter data initialized successfully.")
