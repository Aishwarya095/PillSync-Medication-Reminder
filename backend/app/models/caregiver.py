from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    contact_number = Column(String(20), nullable=True)
    qualification = Column(String(150), nullable=True)
    relationship_type = Column(String(100), nullable=True)  # e.g., Primary Nurse, Family Caregiver, Spouse
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="caregiver_profile")
    assignments = relationship("CaregiverAssignment", back_populates="caregiver", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CaregiverProfile(id={self.id}, name='{self.full_name}')>"


class CaregiverAssignment(Base):
    __tablename__ = "caregiver_assignments"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, PENDING, INACTIVE
    notes = Column(String(255), nullable=True)

    # Relationships
    caregiver = relationship("CaregiverProfile", back_populates="assignments")
    patient = relationship("PatientProfile", back_populates="caregiver_assignments")

    def __repr__(self):
        return f"<CaregiverAssignment(caregiver_id={self.caregiver_id}, patient_id={self.patient_id})>"
