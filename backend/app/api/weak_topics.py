from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.analytics import WeakTopicResponse
from app.analytics.weak_topic_engine import detect_weak_topics
from app.auth.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/user", tags=["Weak Topics"])

@router.get("/weak-topics", response_model=List[WeakTopicResponse])
def get_user_weak_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return detect_weak_topics(db, current_user.id)
