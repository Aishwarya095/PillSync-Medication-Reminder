from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, description="User full name")
    role: str = Field("PATIENT", description="PATIENT, CAREGIVER, or ADMIN")
    contact_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    initial_condition: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
    is_active: bool
    full_name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str
    full_name: str
