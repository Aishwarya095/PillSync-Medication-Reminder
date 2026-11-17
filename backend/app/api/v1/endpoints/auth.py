from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.models.patient import PatientProfile, HealthCondition
from backend.app.models.caregiver import CaregiverProfile
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserSummary

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register a new user")
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user (Patient, Caregiver, or Admin), initialize their profile, and issue a JWT token.
    """
    # 1. Check if email already registered
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # 2. Resolve Role
    role_name = user_in.role.upper()
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        # Default to PATIENT if not recognized
        role = db.query(Role).filter(Role.name == "PATIENT").first()

    # 3. Create User
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        role_id=role.id,
        is_active=True,
    )
    db.add(new_user)
    db.flush()  # Populates new_user.id

    # 4. Create Role-Specific Profile
    if role.name == "PATIENT":
        patient_profile = PatientProfile(
            user_id=new_user.id,
            full_name=user_in.full_name,
            contact_number=user_in.contact_number,
            emergency_contact=user_in.emergency_contact,
        )
        db.add(patient_profile)
        db.flush()

        # Add optional initial health condition
        if user_in.initial_condition and user_in.initial_condition.strip():
            condition = HealthCondition(
                patient_id=patient_profile.id,
                condition_name=user_in.initial_condition.strip(),
                severity="Moderate",
                notes="Registered during account creation",
            )
            db.add(condition)

    elif role.name == "CAREGIVER":
        caregiver_profile = CaregiverProfile(
            user_id=new_user.id,
            full_name=user_in.full_name,
            contact_number=user_in.contact_number,
            qualification="Registered Caregiver",
        )
        db.add(caregiver_profile)

    db.commit()
    db.refresh(new_user)

    # 5. Issue JWT Token
    access_token = create_access_token(subject=new_user.email, role=role.name)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=role.name,
        user_id=new_user.id,
        email=new_user.email,
        full_name=user_in.full_name,
    )


@router.post("/login", response_model=Token, summary="User Login & Token Generation")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user credentials and return a signed JWT token.
    """
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently inactive. Contact your administrator.",
        )

    # Determine full name
    full_name = user.email.split("@")[0].title()
    if user.patient_profile and user.patient_profile.full_name:
        full_name = user.patient_profile.full_name
    elif user.caregiver_profile and user.caregiver_profile.full_name:
        full_name = user.caregiver_profile.full_name

    role_name = user.role.name if user.role else "PATIENT"
    access_token = create_access_token(subject=user.email, role=role_name)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=role_name,
        user_id=user.id,
        email=user.email,
        full_name=full_name,
    )


@router.get("/me", response_model=UserSummary, summary="Get current logged-in user details")
def get_me(current_user: User = Depends(get_current_user)):
    """Return basic information about the authenticated user."""
    full_name = current_user.email.split("@")[0].title()
    if current_user.patient_profile and current_user.patient_profile.full_name:
        full_name = current_user.patient_profile.full_name
    elif current_user.caregiver_profile and current_user.caregiver_profile.full_name:
        full_name = current_user.caregiver_profile.full_name

    return UserSummary(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.name if current_user.role else "UNKNOWN",
        is_active=current_user.is_active,
        full_name=full_name,
    )

