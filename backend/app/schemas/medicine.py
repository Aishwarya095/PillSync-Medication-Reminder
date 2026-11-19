from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# Schedule Schemas
class ScheduleBase(BaseModel):
    time_str: str = Field(..., example="08:00")
    label: Optional[str] = Field(None, example="Morning Dose")


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleResponse(ScheduleBase):
    id: int
    medicine_id: int
    is_active: bool

    class Config:
        from_attributes = True


# Medicine Schemas
class MedicineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, example="Metformin")
    dosage: str = Field(..., min_length=1, max_length=100, example="500 mg")
    form: str = Field("Tablet", max_length=50, example="Tablet")
    disease_category: str = Field("General", max_length=100, example="Diabetes")
    frequency: str = Field("Once daily", max_length=50, example="Twice daily")
    meal_relation: str = Field("After Meal", max_length=50, example="After Meal")
    current_stock: int = Field(30, ge=0, example=30)
    low_stock_threshold: int = Field(5, ge=0, example=5)
    instructions: Optional[str] = Field(None, example="Take with a full glass of water after meals.")


class MedicineCreate(MedicineBase):
    schedule_times: List[str] = Field(default=["08:00"], example=["08:00", "20:00"])


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    form: Optional[str] = None
    disease_category: Optional[str] = None
    frequency: Optional[str] = None
    meal_relation: Optional[str] = None
    current_stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    instructions: Optional[str] = None
    schedule_times: Optional[List[str]] = None


class MedicineRefill(BaseModel):
    quantity: int = Field(30, gt=0, example=30)


class MedicineResponse(MedicineBase):
    id: int
    user_id: int
    is_active: bool
    is_low_stock: bool = False
    schedules: List[ScheduleResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Dose Action & Timeline Schemas
class DoseActionRequest(BaseModel):
    medicine_id: int
    schedule_id: Optional[int] = None
    scheduled_time: str = Field(..., example="08:00")
    action: str = Field("TAKEN", example="TAKEN")  # TAKEN, MISSED, SNOOZED


class DoseLogResponse(BaseModel):
    id: int
    medicine_id: int
    schedule_id: Optional[int]
    scheduled_time: str
    log_date: str
    action: str
    taken_at: datetime

    class Config:
        from_attributes = True


class TodayTimelineItem(BaseModel):
    timeline_id: str
    medicine_id: int
    medicine_name: str
    dosage: str
    form: str
    disease_category: str
    meal_relation: str
    instructions: Optional[str]
    schedule_id: Optional[int]
    scheduled_time: str
    time_period: str  # "Morning", "Afternoon", "Evening", "Night"
    current_stock: int
    is_low_stock: bool
    status: str  # "PENDING", "DUE_NOW", "TAKEN", "MISSED", "SNOOZED"
    taken_at: Optional[datetime] = None


class TodaySummaryResponse(BaseModel):
    total_medicines: int
    today_scheduled_doses: int
    taken_doses: int
    pending_doses: int
    adherence_percentage: float
    low_stock_count: int
    timeline: List[TodayTimelineItem]
