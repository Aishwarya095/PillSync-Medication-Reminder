from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    date_of_birth = Column(String(20), nullable=True)  # e.g., YYYY-MM-DD
    contact_number = Column(String(20), nullable=True)
    emergency_contact = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    health_conditions = relationship("HealthCondition", back_populates="patient", cascade="all, delete-orphan")
    caregiver_assignments = relationship("CaregiverAssignment", back_populates="patient", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PatientProfile(id={self.id}, name='{self.full_name}')>"


class HealthCondition(Base):
    __tablename__ = "health_conditions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    condition_name = Column(String(100), nullable=False)
    diagnosed_date = Column(String(50), nullable=True)
    severity = Column(String(50), default="Moderate", nullable=True)  # Mild, Moderate, Severe
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)

    # Relationships
    patient = relationship("PatientProfile", back_populates="health_conditions")

    def __repr__(self):
        return f"<HealthCondition(id={self.id}, condition='{self.condition_name}')>"

