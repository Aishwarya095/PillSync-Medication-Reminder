from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user, require_role
from backend.app.models.user import User
from backend.app.models.patient import PatientProfile, HealthCondition
from backend.app.models.caregiver import CaregiverProfile, CaregiverAssignment
from backend.app.schemas.profile import (
    PatientProfileResponse,
    PatientProfileUpdate,
    HealthConditionCreate,
    HealthConditionResponse,
    CaregiverProfileResponse,
    CaregiverProfileUpdate,
    AssignedPatientSummary,
)

router = APIRouter()


# -------------------------------------------------------------
# Patient Profile Endpoints
# -------------------------------------------------------------
@router.get("/patient", response_model=PatientProfileResponse, summary="Get current patient profile")
@router.get("/patient/me", response_model=PatientProfileResponse, summary="Get current patient profile")
def get_patient_profile(
    current_user: User = Depends(require_role(["PATIENT"])),
    db: Session = Depends(get_db),
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        profile = PatientProfile(user_id=current_user.id, full_name=current_user.email.split("@")[0].title())
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return PatientProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        contact_number=profile.contact_number,
        emergency_contact=profile.emergency_contact,
        blood_group=profile.blood_group,
        address=profile.address,
        health_conditions=[
            HealthConditionResponse.model_validate(c) for c in profile.health_conditions
        ],
    )


@router.put("/patient", response_model=PatientProfileResponse, summary="Update patient profile details")
@router.put("/patient/me", response_model=PatientProfileResponse, summary="Update patient profile details")
def update_patient_profile(
    profile_in: PatientProfileUpdate,
    current_user: User = Depends(require_role(["PATIENT"])),
    db: Session = Depends(get_db),
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)

    return PatientProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        date_of_birth=profile.date_of_birth,
        contact_number=profile.contact_number,
        emergency_contact=profile.emergency_contact,
        blood_group=profile.blood_group,
        address=profile.address,
        health_conditions=[
            HealthConditionResponse.model_validate(c) for c in profile.health_conditions
        ],
    )


@router.post("/patient/conditions", response_model=HealthConditionResponse, status_code=status.HTTP_201_CREATED, summary="Add a health condition")
def add_health_condition(
    condition_in: HealthConditionCreate,
    current_user: User = Depends(require_role(["PATIENT"])),
    db: Session = Depends(get_db),
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    new_condition = HealthCondition(
        patient_id=profile.id,
        condition_name=condition_in.condition_name,
        diagnosed_date=condition_in.diagnosed_date,
        severity=condition_in.severity or "Moderate",
        notes=condition_in.notes,
    )
    db.add(new_condition)
    db.commit()
    db.refresh(new_condition)
    return new_condition


@router.delete("/patient/conditions/{condition_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove a health condition")
def delete_health_condition(
    condition_id: int,
    current_user: User = Depends(require_role(["PATIENT"])),
    db: Session = Depends(get_db),
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    condition = db.query(HealthCondition).filter(
        HealthCondition.id == condition_id,
        HealthCondition.patient_id == profile.id,
    ).first()

    if not condition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health condition not found")

    db.delete(condition)
    db.commit()
    return None


# -------------------------------------------------------------
# Caregiver Profile Endpoints
# -------------------------------------------------------------
@router.get("/caregiver", response_model=CaregiverProfileResponse, summary="Get caregiver profile & assigned patients")
@router.get("/caregiver/me", response_model=CaregiverProfileResponse, summary="Get caregiver profile & assigned patients")
def get_caregiver_profile(
    current_user: User = Depends(require_role(["CAREGIVER"])),
    db: Session = Depends(get_db),
):
    profile = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == current_user.id).first()
    if not profile:
        profile = CaregiverProfile(user_id=current_user.id, full_name=current_user.email.split("@")[0].title())
        db.add(profile)
        db.commit()
        db.refresh(profile)

    assigned_list: List[AssignedPatientSummary] = []
    for assign in profile.assignments:
        patient = assign.patient
        if patient:
            conditions = [c.condition_name for c in patient.health_conditions]
            assigned_list.append(
                AssignedPatientSummary(
                    patient_profile_id=patient.id,
                    patient_user_id=patient.user_id,
                    patient_name=patient.full_name,
                    patient_email=patient.user.email if patient.user else "",
                    contact_number=patient.contact_number,
                    emergency_contact=patient.emergency_contact,
                    conditions=conditions,
                    assigned_at=assign.assigned_at,
                    status=assign.status,
                )
            )

    return CaregiverProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        contact_number=profile.contact_number,
        qualification=profile.qualification,
        relationship_type=profile.relationship_type,
        assigned_patients=assigned_list,
    )


@router.put("/caregiver", response_model=CaregiverProfileResponse, summary="Update caregiver profile details")
@router.put("/caregiver/me", response_model=CaregiverProfileResponse, summary="Update caregiver profile details")
def update_caregiver_profile(
    profile_in: CaregiverProfileUpdate,
    current_user: User = Depends(require_role(["CAREGIVER"])),
    db: Session = Depends(get_db),
):
    profile = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)

    return get_caregiver_profile(current_user=current_user, db=db)
