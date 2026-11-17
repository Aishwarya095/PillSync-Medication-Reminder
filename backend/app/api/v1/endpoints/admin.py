from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import require_role
from backend.app.models.user import User
from backend.app.models.patient import PatientProfile
from backend.app.models.caregiver import CaregiverProfile, CaregiverAssignment
from backend.app.schemas.profile import CaregiverAssignmentCreate

router = APIRouter()


@router.get("/users", summary="Admin: List all registered platform users")
def list_all_users(
    admin_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    result = []
    for u in users:
        full_name = "N/A"
        if u.patient_profile:
            full_name = u.patient_profile.full_name
        elif u.caregiver_profile:
            full_name = u.caregiver_profile.full_name

        result.append({
            "id": u.id,
            "email": u.email,
            "role": u.role.name if u.role else "UNKNOWN",
            "full_name": full_name,
            "is_active": u.is_active,
            "created_at": u.created_at,
        })
    return result


@router.get("/caregivers", summary="Admin: List all available caregivers")
def list_caregivers(
    admin_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    caregivers = db.query(CaregiverProfile).all()
    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "email": c.user.email if c.user else "",
            "full_name": c.full_name,
            "contact_number": c.contact_number,
            "qualification": c.qualification,
            "relationship_type": c.relationship_type,
            "assigned_count": len(c.assignments),
        }
        for c in caregivers
    ]


@router.get("/patients", summary="Admin: List all available patients")
def list_patients(
    admin_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    patients = db.query(PatientProfile).all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "email": p.user.email if p.user else "",
            "full_name": p.full_name,
            "contact_number": p.contact_number,
            "emergency_contact": p.emergency_contact,
            "conditions": [c.condition_name for c in p.health_conditions],
        }
        for p in patients
    ]


@router.post("/assign", status_code=status.HTTP_201_CREATED, summary="Admin: Assign caregiver to patient")
@router.post("/assign-caregiver", status_code=status.HTTP_201_CREATED, summary="Admin: Assign caregiver to patient")
def assign_caregiver_to_patient(
    assignment_in: CaregiverAssignmentCreate,
    admin_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    caregiver = db.query(CaregiverProfile).filter(CaregiverProfile.id == assignment_in.caregiver_id).first()
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found")

    patient = db.query(PatientProfile).filter(PatientProfile.id == assignment_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    existing = db.query(CaregiverAssignment).filter(
        CaregiverAssignment.caregiver_id == caregiver.id,
        CaregiverAssignment.patient_id == patient.id,
    ).first()

    if existing:
        existing.status = "ACTIVE"
        existing.notes = assignment_in.notes
        db.commit()
        return {"message": "Assignment updated to active", "id": existing.id}

    new_assignment = CaregiverAssignment(
        caregiver_id=caregiver.id,
        patient_id=patient.id,
        status="ACTIVE",
        notes=assignment_in.notes or "Assigned by Administrator",
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {
        "message": f"Successfully assigned Caregiver '{caregiver.full_name}' to Patient '{patient.full_name}'",
        "assignment_id": new_assignment.id,
    }
