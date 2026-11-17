from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Health Condition Schemas
class HealthConditionCreate(BaseModel):
    condition_name: str
    diagnosed_date: Optional[str] = None
    severity: Optional[str] = "Moderate"
    notes: Optional[str] = None


class HealthConditionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    condition_name: str
    diagnosed_date: Optional[str] = None
    severity: Optional[str] = None
    notes: Optional[str] = None


# Patient Profile Schemas
class PatientProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    contact_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None


class PatientProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    email: str
    full_name: str
    date_of_birth: Optional[str] = None
    contact_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    health_conditions: List[HealthConditionResponse] = []


# Caregiver Profile Schemas
class CaregiverProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    contact_number: Optional[str] = None
    qualification: Optional[str] = None
    relationship_type: Optional[str] = None


class AssignedPatientSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    patient_profile_id: int
    patient_name: str
    patient_email: str
    contact_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    conditions: List[str] = []
    assigned_at: datetime
    status: str


class CaregiverProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    email: str
    full_name: str
    contact_number: Optional[str] = None
    qualification: Optional[str] = None
    relationship_type: Optional[str] = None
    assigned_patients: List[AssignedPatientSummary] = []


# Assignment Schema (Admin function)
class CaregiverAssignmentCreate(BaseModel):
    caregiver_id: int
    patient_id: int
    notes: Optional[str] = None
