from fastapi import APIRouter
from backend.app.api.v1.endpoints import health, auth, profiles, admin, medicines

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles & Health"])
api_router.include_router(medicines.router, prefix="/medicines", tags=["Medicines & Schedules"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Operations"])
