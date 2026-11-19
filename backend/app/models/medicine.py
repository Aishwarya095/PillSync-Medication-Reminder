from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)  # e.g. "500 mg", "1 tablet"
    form = Column(String(50), default="Tablet", nullable=False)  # Tablet, Capsule, Syrup, Drops, Injection
    disease_category = Column(String(100), default="General", nullable=False)  # Diabetes, Hypertension, etc.
    frequency = Column(String(50), default="Once daily", nullable=False)  # Once daily, Twice daily, etc.
    meal_relation = Column(String(50), default="After Meal", nullable=False)  # Before Meal, After Meal, With Food
    current_stock = Column(Integer, default=30, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    instructions = Column(Text, nullable=True)  # e.g. "Take with warm water"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="medicines")
    schedules = relationship("MedicineSchedule", back_populates="medicine", cascade="all, delete-orphan")
    dose_logs = relationship("DoseLog", back_populates="medicine", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Medicine(id={self.id}, name='{self.name}', dosage='{self.dosage}')>"


class MedicineSchedule(Base):
    __tablename__ = "medicine_schedules"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    time_str = Column(String(10), nullable=False)  # "08:00", "13:00", "20:00" (24h format)
    label = Column(String(50), nullable=True)  # "Morning", "Afternoon", "Evening", "Night"
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    medicine = relationship("Medicine", back_populates="schedules")
    dose_logs = relationship("DoseLog", back_populates="schedule", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MedicineSchedule(id={self.id}, time='{self.time_str}', label='{self.label}')>"


class DoseLog(Base):
    __tablename__ = "dose_logs"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    schedule_id = Column(Integer, ForeignKey("medicine_schedules.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scheduled_time = Column(String(10), nullable=False)  # "08:00"
    log_date = Column(String(10), nullable=False, index=True)  # "YYYY-MM-DD"
    action = Column(String(20), nullable=False)  # "TAKEN", "MISSED", "SNOOZED"
    taken_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)

    # Relationships
    medicine = relationship("Medicine", back_populates="dose_logs")
    schedule = relationship("MedicineSchedule", back_populates="dose_logs")
    user = relationship("User", back_populates="dose_logs")

    def __repr__(self):
        return f"<DoseLog(id={self.id}, med_id={self.medicine_id}, action='{self.action}', date='{self.log_date}')>"
