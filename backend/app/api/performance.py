from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import UserPerformanceOverview
from app.analytics.user_performance import get_user_performance_overview
from app.auth.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/user", tags=["User Performance"])

@router.get("/performance", response_model=UserPerformanceOverview)
def get_user_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_performance_overview(db, current_user.id)
