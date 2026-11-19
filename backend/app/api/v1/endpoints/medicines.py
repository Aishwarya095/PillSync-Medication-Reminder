from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.patient import PatientProfile
from backend.app.models.caregiver import CaregiverProfile, CaregiverAssignment
from backend.app.models.medicine import Medicine, MedicineSchedule, DoseLog
from backend.app.schemas.medicine import (
    MedicineCreate,
    MedicineUpdate,
    MedicineResponse,
    MedicineRefill,
    DoseActionRequest,
    DoseLogResponse,
    TodayTimelineItem,
    TodaySummaryResponse,
)

router = APIRouter()


def _get_time_period(time_str: str) -> str:
    """Helper to classify time of day."""
    try:
        hour = int(time_str.split(":")[0])
        if hour < 12:
            return "Morning"
        elif hour < 17:
            return "Afternoon"
        elif hour < 21:
            return "Evening"
        else:
            return "Night"
    except Exception:
        return "Day"


def _verify_target_patient_access(target_patient_id: Optional[int], current_user: User, db: Session) -> int:
    """Resolve target patient user_id ensuring caregiver/admin authorization."""
    if target_patient_id is None or target_patient_id == current_user.id:
        return current_user.id

    role = current_user.role.name.upper()
    if role == "ADMIN":
        return target_patient_id

    if role == "CAREGIVER":
        caregiver_profile = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == current_user.id).first()
        if not caregiver_profile:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Caregiver profile not found")
        assignment = (
            db.query(CaregiverAssignment)
            .filter(
                CaregiverAssignment.caregiver_id == caregiver_profile.id,
                CaregiverAssignment.patient_id == target_patient_id,
            )
            .first()
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access medications for this patient",
            )
        return target_patient_id

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


@router.get("", response_model=List[MedicineResponse])
def get_medicines(
    patient_id: Optional[int] = Query(None, description="Optional target patient ID for caregivers/admins"),
    disease: Optional[str] = Query(None, description="Filter by disease category"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all active medications for patient with stock indicators."""
    target_user_id = _verify_target_patient_access(patient_id, current_user, db)

    query = db.query(Medicine).filter(Medicine.user_id == target_user_id, Medicine.is_active == True)
    if disease and disease.lower() != "all":
        query = query.filter(Medicine.disease_category.ilike(f"%{disease}%"))

    meds = query.order_by(Medicine.name.asc()).all()

    # Populate is_low_stock computation
    results = []
    for med in meds:
        med_dict = MedicineResponse.from_orm(med)
        med_dict.is_low_stock = med.current_stock <= med.low_stock_threshold
        results.append(med_dict)
    return results


@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    payload: MedicineCreate,
    patient_id: Optional[int] = Query(None, description="Optional target patient ID for caregivers/admins"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new medication and configure scheduled reminder times."""
    target_user_id = _verify_target_patient_access(patient_id, current_user, db)

    new_med = Medicine(
        user_id=target_user_id,
        name=payload.name.strip(),
        dosage=payload.dosage.strip(),
        form=payload.form,
        disease_category=payload.disease_category.strip(),
        frequency=payload.frequency,
        meal_relation=payload.meal_relation,
        current_stock=payload.current_stock,
        low_stock_threshold=payload.low_stock_threshold,
        instructions=payload.instructions,
    )
    db.add(new_med)
    db.flush()

    # Create schedules for each time specified
    times = payload.schedule_times or ["08:00"]
    for t in times:
        t_clean = t.strip()
        label = f"{_get_time_period(t_clean)} Dose"
        sched = MedicineSchedule(medicine_id=new_med.id, time_str=t_clean, label=label)
        db.add(sched)

    db.commit()
    db.refresh(new_med)

    res = MedicineResponse.from_orm(new_med)
    res.is_low_stock = new_med.current_stock <= new_med.low_stock_threshold
    return res


@router.get("/{medicine_id}", response_model=MedicineResponse)
def get_medicine_detail(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single medication details."""
    med = db.query(Medicine).filter(Medicine.id == medicine_id, Medicine.is_active == True).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    _verify_target_patient_access(med.user_id, current_user, db)

    res = MedicineResponse.from_orm(med)
    res.is_low_stock = med.current_stock <= med.low_stock_threshold
    return res


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    payload: MedicineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update medication details, stock count, or dosage."""
    med = db.query(Medicine).filter(Medicine.id == medicine_id, Medicine.is_active == True).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    _verify_target_patient_access(med.user_id, current_user, db)

    update_data = payload.dict(exclude_unset=True)
    schedule_times = update_data.pop("schedule_times", None)

    for field, value in update_data.items():
        if value is not None:
            setattr(med, field, value)

    if schedule_times is not None:
        # Replace schedules
        db.query(MedicineSchedule).filter(MedicineSchedule.medicine_id == med.id).delete()
        for t in schedule_times:
            t_clean = t.strip()
            sched = MedicineSchedule(
                medicine_id=med.id,
                time_str=t_clean,
                label=f"{_get_time_period(t_clean)} Dose",
            )
            db.add(sched)

    med.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(med)

    res = MedicineResponse.from_orm(med)
    res.is_low_stock = med.current_stock <= med.low_stock_threshold
    return res


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a medication from active inventory."""
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    _verify_target_patient_access(med.user_id, current_user, db)

    med.is_active = False
    med.updated_at = datetime.utcnow()
    db.commit()
    return None


@router.post("/{medicine_id}/refill", response_model=MedicineResponse)
def refill_medicine(
    medicine_id: int,
    payload: MedicineRefill,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Quick refill stock for a medication (e.g. +30 pills)."""
    med = db.query(Medicine).filter(Medicine.id == medicine_id, Medicine.is_active == True).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    _verify_target_patient_access(med.user_id, current_user, db)

    med.current_stock += payload.quantity
    med.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(med)

    res = MedicineResponse.from_orm(med)
    res.is_low_stock = med.current_stock <= med.low_stock_threshold
    return res


@router.get("/timeline/today", response_model=TodaySummaryResponse)
def get_today_timeline(
    patient_id: Optional[int] = Query(None, description="Optional target patient ID for caregivers/admins"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get live chronological schedule for today with real-time status and adherence metrics."""
    target_user_id = _verify_target_patient_access(patient_id, current_user, db)

    today_str = date.today().isoformat()
    now_time = datetime.now()
    now_hm = now_time.strftime("%H:%M")

    # Fetch active medicines with their schedules
    meds = db.query(Medicine).filter(Medicine.user_id == target_user_id, Medicine.is_active == True).all()

    # Fetch today's logs for target user
    logs = db.query(DoseLog).filter(DoseLog.user_id == target_user_id, DoseLog.log_date == today_str).all()
    # Map (medicine_id, scheduled_time) -> DoseLog
    log_map = {(log.medicine_id, log.scheduled_time): log for log in logs}

    timeline_items: List[TodayTimelineItem] = []
    taken_count = 0
    total_scheduled = 0

    for med in meds:
        schedules = [s for s in med.schedules if s.is_active]
        if not schedules:
            # Fallback default schedule if none attached
            schedules = [MedicineSchedule(medicine_id=med.id, time_str="08:00", label="Morning Dose")]

        for sched in schedules:
            total_scheduled += 1
            key = (med.id, sched.time_str)
            existing_log = log_map.get(key)

            if existing_log:
                status_val = existing_log.action.upper()
                taken_at_val = existing_log.taken_at
                if status_val == "TAKEN":
                    taken_count += 1
            else:
                # Compare current time vs scheduled
                taken_at_val = None
                if sched.time_str <= now_hm:
                    status_val = "DUE_NOW"
                else:
                    status_val = "PENDING"

            timeline_items.append(
                TodayTimelineItem(
                    timeline_id=f"{med.id}-{sched.time_str}",
                    medicine_id=med.id,
                    medicine_name=med.name,
                    dosage=med.dosage,
                    form=med.form,
                    disease_category=med.disease_category,
                    meal_relation=med.meal_relation,
                    instructions=med.instructions,
                    schedule_id=sched.id,
                    scheduled_time=sched.time_str,
                    time_period=_get_time_period(sched.time_str),
                    current_stock=med.current_stock,
                    is_low_stock=med.current_stock <= med.low_stock_threshold,
                    status=status_val,
                    taken_at=taken_at_val,
                )
            )

    # Sort timeline chronologically
    timeline_items.sort(key=lambda x: x.scheduled_time)

    pending_count = max(0, total_scheduled - taken_count)
    adherence = round((taken_count / total_scheduled * 100), 1) if total_scheduled > 0 else 100.0
    low_stock_count = sum(1 for m in meds if m.current_stock <= m.low_stock_threshold)

    return TodaySummaryResponse(
        total_medicines=len(meds),
        today_scheduled_doses=total_scheduled,
        taken_doses=taken_count,
        pending_doses=pending_count,
        adherence_percentage=adherence,
        low_stock_count=low_stock_count,
        timeline=timeline_items,
    )


@router.post("/doses/action", response_model=TodaySummaryResponse)
def record_dose_action(
    payload: DoseActionRequest,
    patient_id: Optional[int] = Query(None, description="Optional target patient ID for caregivers/admins"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Real-time dose logging: mark dose as TAKEN, MISSED, or SNOOZED, and auto-decrement stock."""
    target_user_id = _verify_target_patient_access(patient_id, current_user, db)

    med = db.query(Medicine).filter(Medicine.id == payload.medicine_id, Medicine.is_active == True).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    today_str = date.today().isoformat()
    action_upper = payload.action.upper()

    # Check if a log already exists for today at this scheduled time
    existing_log = (
        db.query(DoseLog)
        .filter(
            DoseLog.user_id == target_user_id,
            DoseLog.medicine_id == med.id,
            DoseLog.scheduled_time == payload.scheduled_time,
            DoseLog.log_date == today_str,
        )
        .first()
    )

    prev_action = existing_log.action.upper() if existing_log else None

    if existing_log:
        existing_log.action = action_upper
        existing_log.taken_at = datetime.utcnow()
    else:
        new_log = DoseLog(
            user_id=target_user_id,
            medicine_id=med.id,
            schedule_id=payload.schedule_id,
            scheduled_time=payload.scheduled_time,
            log_date=today_str,
            action=action_upper,
            taken_at=datetime.utcnow(),
        )
        db.add(new_log)

    # Real-time stock adjustment:
    # If transitioning to TAKEN from not-taken: decrement stock
    if action_upper == "TAKEN" and prev_action != "TAKEN":
        if med.current_stock > 0:
            med.current_stock -= 1
            med.updated_at = datetime.utcnow()
    # If untaking (e.g. snoozing after accidentally marking taken): restore stock
    elif prev_action == "TAKEN" and action_upper != "TAKEN":
        med.current_stock += 1
        med.updated_at = datetime.utcnow()

    db.commit()

    # Return refreshed today summary
    return get_today_timeline(patient_id=target_user_id, current_user=current_user, db=db)
