from sqlalchemy.orm import Session
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.role import Role


def init_db(db: Session = None) -> None:
    """Create all tables and seed initial roles if missing."""
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
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    init_db()
    print("Database tables created and roles seeded successfully.")

